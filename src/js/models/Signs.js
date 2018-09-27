import ItemList from './ItemList.js'
import uuid from 'uuid/v1'

export default class Signs extends ItemList {
  constructor(corpus, idKey, defaultPostData = undefined) {
    idKey = idKey || 'sign_id'
    const listType = 'sign_ids'
    const connectedLists = []
    const relativeToScrollVersion = false
    defaultPostData = defaultPostData ? defaultPostData : { transaction: 'getTextOfFragment' }
    super(corpus, idKey, listType, connectedLists, relativeToScrollVersion, defaultPostData)

    // Setup socket.io listeners
    this.socket.on('receiveTextOfFragment', msg => {
      this.corpus.response(this.processPopulate(msg))
    })

    this.socket.on('finishRemoveSigns', msg => {
      this.corpus.response(this.finishDeleteSign(msg))
    })

    this.socket.on('finishAddSigns', msg => {
      this.corpus.response(this.finishAddSign(msg))
    })
  }

  formatRecord(record) {
    return {
      // Note that the sign processing function below
      // will also add a property col_id and line_id
      // if a sign is linked to a column start or
      // line start sign_char_attribute.
      sign_id: ~~record.sign_id, // Ensure positive integer with bitwise operator
      next_sign_ids: Array.isArray(record.next_sign_ids)
        ? record.next_sign_ids
        : [record.next_sign_ids],
      sign_char_ids: record.sign_char_ids || [],
    }
  }

  /**
   * This return the sign_char that is NOT marked
   * as a variant.
   */

  getSignChar(sign, scroll_version_id) {
    let signChar = undefined
    if (this._items[sign] && this._items[sign].sign_char_ids.length === 1) {
      signChar = this._items[sign].sign_char_ids[0]
    } else {
      for (let i = 0, char; (char = this._items[sign].sign_char_ids[i]); i++) {
        if (!this.corpus.signChars.get(char, ~~scroll_version_id).is_variant) {
          signChar = char
          break
        }
      }
    }
    return signChar
  }

  /**
   * This returns the next sign_id.  It checks if
   * we have selected a sign other than the default
   * next_sign_id[0].
   */

  getNextSign(sign) {
    let nextSign = undefined
    if (this._items[sign].selectedNextSign) {
      nextSign = this._items[sign].selectedNextSign
    } else {
      nextSign = this._items[sign].next_sign_ids[0]
    }
    return nextSign
  }

  /**
   * This method returns both the list of sign_ids in
   * a range, and a list of complete line_ids in that range.
   */

  getSignRange(firstSign, secondSign) {
    let signList = []
    let lineList = []
    let currentLine = undefined
    let currentSign = firstSign
    let finished = false
    do {
      signList.push(currentSign)
      if (this.get(currentSign).line_id) {
        if (!currentLine) currentLine = this.get(currentSign).line_id
        else if (currentLine !== this.get(currentSign).line_id) lineList.push(currentLine)
      }
      if (currentSign === secondSign) finished = true
      // Maybe we help shorten this process, by checking if we entered a new scroll_version_id?
    } while (!finished && (currentSign = this.getNextSign(currentSign)))
    if (!finished) {
      console.log('go in reverse.')
      signList = []
      lineList = []
      currentLine = undefined
      currentSign = secondSign
      finished = false
      do {
        signList.push(currentSign)
        if (this.get(currentSign).line_id) {
          if (!currentLine) currentLine = this.get(currentSign).line_id
          else if (currentLine !== this.get(currentSign).line_id) lineList.push(currentLine)
        }
        if (currentSign === firstSign) finished = true
      } while (!finished && (currentSign = this.getNextSign(currentSign)))
    }
    return finished ? { sign_ids: signList, line_ids: lineList } : undefined
  }

  /* istanbul ignore next */
  removeItem(key, scroll_version_id = undefined) {
    /**
     * Add axios command to remove from database.
     * run super on successful completion.
     */
    return new Promise(resolve => {
      resolve(super.removeItem(key, scroll_version_id))
    })
  }

  /**
   * The following functions are for database mutation.
   */

  deleteSign(sign, scroll_version_id, col_id, line_id) {
    return this.corpus.request('removeSigns', {
      scroll_version_id: scroll_version_id,
      col_id: col_id,
      line_id: line_id,
      sign_id: [sign],
    })
  }

  finishDeleteSign(msg) {
    return new Promise(resolve => {
      const results = msg[0]
      for (const key of Object.keys(results)) {
        if (results[key] === 'deleted') {
          const prevSign = this.prevSignInCol(
            ~~key,
            ~~msg.payload.scroll_version_id,
            ~~msg.payload.col_id,
            ~~msg.payload.line_id
          )
          const nextSign = this.nextSign(
            key,
            ~~msg.payload.scroll_version_id,
            ~~msg.payload.col_id,
            ~~msg.payload.line_id
          )
          const next_sign_ids = this.get(prevSign.sign_id).next_sign_ids
          next_sign_ids.splice(next_sign_ids.indexOf(~~key), 1)
          next_sign_ids.push(nextSign.sign_id)
          this.alterItemAtKey(prevSign.sign_id, { next_sign_ids: next_sign_ids })
          this.removeItem(~~key)
          // I should remove the sign_char_ids and connected attribute_values
        }
      }
      resolve(msg)
    })
  }

  /**TODO: we should be able to add attributes along with the sign, since we
   * cannot add, for instance, spaces. This needs some implementation in the
   * SQE_API.  Also, since no sign_char_id is returned with the creation of
   * the new sign, we need to refresh the whole list to get the sign_char_id.
   */

  addSignBefore(sign, char, scroll_version_id, col_id, line_id) {
    let prevSign = this.prevSignInCol(sign, scroll_version_id, col_id, line_id)
    let unique = uuid()
    this.corpus.signChars._insertItem(
      {
        sign_char_id: unique,
        sign_id: unique,
        is_variant: 0,
        char: char === ' ' ? '' : char,
        attribute_values: this.corpus.signChars
          .get(this.getSignChar(prevSign.sign_id, scroll_version_id), scroll_version_id)
          .attribute_values.filter(x => x.value === 18 || x.value === 19 || x.value === 20), // Copy only reconstructed or damaged.
        rois: [],
      },
      scroll_version_id
    )
    this._insertItem({
      sign_id: unique,
      next_sign_ids: this.get(prevSign.sign_id).next_sign_ids,
      sign_char_ids: [unique],
    })
    this.alterItemAtKey(prevSign.sign_id, { next_sign_ids: [unique] })
    return this.corpus.request('addSigns', {
      scroll_version_id: scroll_version_id,
      col_id: col_id,
      line_id: line_id,
      signs: [
        {
          previous_sign_id: prevSign.sign_id,
          sign: char === ' ' ? '' : char,
          uuid: unique,
          attribute_value_ids: char === ' ' ? [2] : [], // Set attribute for a space or letter.
          next_sign_id: sign,
        },
      ],
    })
  }

  // TODO: The SQE_API does not return the new sign_char_attribute_id corresponding to
  // the newly created sign.  For this reason, we cannot change the attributes
  // of newly added signs.  The SQE_API should be fixed to provide both the
  // sign_id, the sign_char_id, and the sign_char_attribute_ids of the newly added sign.
  finishAddSign(msg) {
    return new Promise(resolve => {
      const results = msg[0]
      for (const key of Object.keys(results)) {
        let prevID, nextID, char, attrs
        for (let i = 0, sign; (sign = msg.payload.signs[i]); i++) {
          if (sign.uuid === key) {
            prevID = sign.previous_sign_id
            nextID = sign.next_sign_id
            char = sign.sign
            attrs = sign.attribute_value_ids.filter(x => x !== 1).map(x => {
              return { value: x }
            })
          }
        }
        const currentAttrValues = this.corpus.signChars
          .get(
            this.getSignChar(prevID, msg.payload.scroll_version_id),
            msg.payload.scroll_version_id
          )
          .attribute_values.filter(x => x.value === 18 || x.value === 19 || x.value === 20)
        currentAttrValues.push(...attrs)
        this.corpus.signChars._insertItem(
          this.corpus.signChars.formatRecord({
            sign_char_id: ~~results[key].sign_char_id,
            is_variant: 0,
            char: char,
            attribute_values: currentAttrValues, // Copy only reconstructed or damaged.
            rois: [],
          }),
          msg.payload.scroll_version_id
        )
        this._insertItem({
          sign_id: ~~results[key].sign_id,
          next_sign_ids: [nextID],
          sign_char_ids: [~~results[key].sign_char_id],
        })
        if (this.get(prevID) && this.get(nextID)) {
          this.alterItemAtKey(prevID, { next_sign_ids: [~~results[key].sign_id] })

          if (this.corpus.signChars.get(key, msg.payload.scroll_version_id))
            this.corpus.signChars.removeItem(key, msg.payload.scroll_version_id)
          if (this.get(key)) this.removeItem(key)
        } else {
          // Concurrent changes were made, reload the whole column
          this.requestPopulate({
            scroll_version_id: msg.payload.scroll_version_id,
            col_id: msg.payload.col_id,
          })
        }
      }
      resolve(msg)
    })
  }

  addSignAfter(sign, scroll_version_id, col_id, line_id) {
    // this.removeItem(sign)
    const prevSign = this.prevSignInCol(sign, scroll_version_id, col_id, line_id)
    const nextSign = this.nextSign(sign, scroll_version_id, col_id, line_id)
    const next_sign_ids = this.get(prevSign.sign_id).next_sign_ids
    next_sign_ids.splice(next_sign_ids.indexOf(sign), 1)
    next_sign_ids.push(nextSign.sign_id)
    this.alterItemAtKey(prevSign.sign_id, { next_sign_ids: next_sign_ids })
  }

  /**
   * The following functions are used to request and
   * process data from the database.
   */

  processPopulate(message) {
    const init = window.performance.now()
    return new Promise(resolve => {
      if (message.text) {
        const process = window.performance.now()
        const scroll_version_id = message.payload.scroll_version_id
        for (let j = 0, col; (col = message.text[0].fragments[j]); j++) {
          const col_id = col.fragment_id
          let col_sign_id
          const col_line_ids = [] //Could use propagateAddData, but this is probably faster
          const col_sign_ids = new Array(col.lines.length) //Could use propagateAddData, but this is probably faster
          for (let k = 0, line; (line = col.lines[k]); k++) {
            const line_id = line.line_id
            let line_sign_id
            col_line_ids.push(line_id)
            const line_sign_ids = [] //Could use propagateAddData, but this is probably faster
            this.processLine(line.signs, scroll_version_id, k, col_id, line_id).then(
              ([line_signs, line_sign_id, count, returned_col_sign_id]) => {
                col_sign_id = returned_col_sign_id ? returned_col_sign_id : col_sign_id
                col_sign_ids[count] = line_signs
                this.corpus.lines._insertItem(
                  {
                    name: line.line_name,
                    line_id: line.line_id,
                    scroll_version_id: scroll_version_id,
                    line_sign_id: line_sign_id,
                    signs: line_signs,
                  },
                  scroll_version_id
                )
                this.corpus.signs.alterItemAtKey(line_sign_id, { line_id: line.line_id })
                if (count === col.lines.length - 1) {
                  this.corpus.cols._insertItem(
                    {
                      name: col.fragment_name,
                      col_id: col.fragment_id,
                      scroll_version_id: scroll_version_id,
                      col_sign_id: col_sign_id,
                      signs: col_sign_ids.reduce((acc, val) => acc.concat(val), []),
                    },
                    scroll_version_id
                  )
                  this.corpus.signs.alterItemAtKey(col_sign_id, { col_id: col.fragment_id })
                  console.log('Sign stream process: ', window.performance.now() - process)
                }
              }
            )
          }
        }
        console.log('Total: ', window.performance.now() - init)
        resolve(message)
      } else {
        resolve(message)
      }
    })
  }

  processLine(signs, scroll_version_id, count, col_id, line_id) {
    let col_sign_id = undefined
    let line_sign_id = undefined
    let line_sign_ids = []
    return new Promise((resolve, reject) => {
      for (let l = 0, sign; (sign = signs[l]); l++) {
        const sign_id = sign.sign_id
        line_sign_ids.push(sign_id)
        let next_sign_ids = sign.next_sign_ids
        if (!Array.isArray(next_sign_ids)) next_sign_ids = [next_sign_ids] // next_sign_ids must always be an array.

        // Create signChar
        this.createSignChar(sign.chars, sign_id, scroll_version_id, l).then(
          ([signChars, returned_line_sign_id, signCount, returned_col_sign_id]) => {
            // Create sign
            this._items[sign_id] = this.formatRecord({
              sign_id: sign_id,
              next_sign_ids: sign.next_sign_ids,
              sign_char_ids: signChars,
            })
            if (returned_line_sign_id) line_sign_id = returned_line_sign_id
            if (returned_col_sign_id) col_sign_id = returned_col_sign_id
            if (signCount === signs.length - 1) {
              console.log('processed line', count)
              resolve([line_sign_ids, line_sign_id, count, col_sign_id])
            }
          }
        )
      }
    })
  }

  createSignChar(chars, sign_id, scroll_version_id, signCount) {
    return new Promise((resolve, reject) => {
      let signChars = [] //Could use propagateAddData, but this is probably faster
      let line_sign_id = undefined
      let col_sign_id = undefined
      for (let m = 0, char; (char = Array.isArray(chars) ? chars[m] : [chars][m]); m++) {
        const sign_char_id = char.sign_char_id
        let signCharAttributeValues = []
        signChars.push(sign_char_id)
        for (
          let n = 0, attribute;
          (attribute = Array.isArray(char.attributes) ? char.attributes[n] : [char.attributes][n]);
          n++
        ) {
          // TODO: get the commentary id's here, then only put a 'comment'
          // key in signCharAttributeValues if a comment actually exists.
          for (
            let o = 0, value;
            (value = Array.isArray(attribute.values) ? attribute.values[o] : [attribute.values][o]);
            o++
          ) {
            signCharAttributeValues.push({
              value: value.attribute_value_id,
              sign_char_attribute_id: ~~attribute.sign_char_attribute_id,
              comment: undefined,
            })
            if (value.attribute_value_id === 10) {
              // new line character
              line_sign_id = sign_id
            } else if (value.attribute_value_id === 12) {
              // new col character
              col_sign_id = sign_id
            }
          }
        }
        // Create signChar
        this.corpus.signChars._items[
          scroll_version_id + '-' + char.sign_char_id
        ] = this.corpus.signChars.formatRecord({
          sign_char_id: char.sign_char_id,
          is_variant: char.is_variant,
          char: char.sign_char,
          attribute_values: signCharAttributeValues,
        })
      }
      resolve([signChars, line_sign_id, signCount, col_sign_id])
    })
  }

  /**
   * The following are a suite of signstream search functions.
   * They follow only the default stream now.  We should perhaps
   * add a reference system to track when the user is not following
   * the defaul stream.
   */

  /**
   * Get the next sign.
   *
   * The function returns an object with the line_id that
   * the next letter sign_id belongs to.
   */
  nextSign(sign, scroll_version_id, col_id, line_id = undefined) {
    if (!line_id) line_id = this.lineFromSignID(sign, col_id, scroll_version_id)
    let sign_id = this.get(this.getNextSign(sign)) ? this.getNextSign(sign) : undefined
    return { line_id: line_id, sign_id: sign_id }
  }

  /**
   * Get the next letter, ignore anchor signs for lines.
   *
   * The function returns an object with the line_id that
   * the next letter sign_id belongs to.
   */
  nextSignLetter(sign, scroll_version_id, col_id, line_id = undefined) {
    if (!line_id) line_id = this.lineFromSignID(sign, col_id, scroll_version_id)
    let sign_id = this.get(this.getNextSign(sign)) ? this.getNextSign(sign) : sign
    if (this.signIsLineStart(sign_id, scroll_version_id)) {
      line_id = this.get(sign_id).line_id
      sign_id = this.get(this.get(sign_id).next_sign_ids[0])
        ? this.get(sign_id).next_sign_ids[0]
        : sign
    }
    return { line_id: line_id, sign_id: sign_id }
  }

  /**
   * Get the previous sign.
   *
   * You have to provide a col_id that you know is linked to the sign.
   * You can also provide a line_id to make the search faster.
   * This returns both the previous sign id and the last line_id
   * in an Object.
   */
  prevSignInCol(sign, scroll_version_id, col_id, line_id = undefined) {
    if (!line_id) line_id = this.lineFromSignID(sign, col_id, scroll_version_id)
    let sign_id = this.corpus.lines.get(line_id, scroll_version_id).line_sign_id
    let reply = undefined
    if (this.get(sign_id).next_sign_ids[0] === sign) {
      // We are at the beginning of a line, grab the previous one
      reply = this.prevLineID(line_id, col_id, scroll_version_id)
    } else {
      while ((sign_id = this.get(sign_id).next_sign_ids[0])) {
        if (this.get(sign_id).next_sign_ids[0] === sign) {
          reply = { line_id: line_id, sign_id: sign_id }
          break
        }
      }
    }
    return reply
  }

  /**
   * Get the previous letter, ignore anchor signs for lines.
   *
   * You have to provide a col_id that you know is linked to the sign.
   * You can also provide a line_id to make the search faster.
   * This returns both the previous sign id and the last line_id
   * in an Object.  Note that it skips signs that link to line_ids!
   */
  prevSignLetterInCol(sign, scroll_version_id, col_id, line_id = undefined) {
    if (!line_id) line_id = this.lineFromSignID(sign, col_id, scroll_version_id)
    let sign_id = this.corpus.lines.get(line_id, scroll_version_id).line_sign_id
    let reply = undefined
    if (this.get(sign_id).next_sign_ids[0] === sign) {
      // We are at the beginning of a line, grab the previous one
      reply = this.prevLineID(line_id, col_id, scroll_version_id)
    } else {
      while ((sign_id = this.get(sign_id).next_sign_ids[0])) {
        if (this.get(sign_id).next_sign_ids[0] === sign) {
          // Let's check for line start and skip over them.
          if (this.signIsLineStart(sign_id, scroll_version_id))
            reply = this.prevLineID(line_id, col_id, scroll_version_id)
          else reply = { line_id: line_id, sign_id: sign_id }
          break
        }
      }
    }
    return reply
  }

  lineSigns(line_id, scroll_version_id) {
    let signs = []
    let sign = this.corpus.lines.get(line_id, scroll_version_id).line_sign_id
    do {
      signs.push(sign)
    } while ((sign = this.getNextSign(sign)) && !this.get(sign).line_id)
    return signs
  }

  lineFromSignID(sign_id, col_id, scroll_version_id) {
    let line_id = undefined
    let sign =
      this.corpus.cols.get(col_id, scroll_version_id) &&
      this.corpus.cols.get(col_id, scroll_version_id).col_sign_id
    if (sign) {
      while ((sign = this.getNextSign(sign))) {
        if (this.get(sign).line_id) {
          line_id = this.get(sign).line_id
        }
        if (sign === sign_id) break
      }
    }
    return line_id
  }

  prevLineID(line_id, col_id, scroll_version_id) {
    let prev_line_sign_id =
      this.corpus.cols.get(col_id, scroll_version_id) &&
      this.corpus.cols.get(col_id, scroll_version_id).col_sign_id
    let nextSign = prev_line_sign_id
    let prev_line_id = this.get(prev_line_sign_id).line_id
    if (prev_line_sign_id && prev_line_id !== line_id) {
      while ((nextSign = this.get(nextSign).next_sign_ids[0])) {
        if (this.get(nextSign).line_id) {
          if (line_id === this.get(nextSign).line_id) break
          prev_line_id = this.get(nextSign).line_id
        }
        prev_line_sign_id = nextSign
      }
    }
    return { line_id: prev_line_id, sign_id: prev_line_sign_id }
  }

  nextLineID(line_id, col_id, scroll_version_id) {
    let sign_id = this.corpus.lines.get(line_id, scroll_version_id).line_sign_id
    while ((sign_id = this.get(sign_id).next_sign_ids[0])) {
      if (this.signIsLineStart(sign_id, scroll_version_id)) {
        line_id = this.get(sign_id).line_id
        break
      }
    }
    return { line_id: line_id, sign_id: sign_id }
  }

  signIsLineStart(sign, scroll_version_id) {
    return (
      []
        .concat(
          ...this.corpus.signChars
            .get(this.get(sign).sign_char_ids[0], scroll_version_id)
            .attribute_values.map(a => a.value)
        )
        .indexOf(10) > -1
    )
  }

  signPosInLine(sign, scroll_version_id, col_id, line_id = undefined) {
    if (!line_id) line_id = this.lineFromSignID(sign, col_id, scroll_version_id)
    let firstSign = this.corpus.lines.get(line_id, scroll_version_id).line_sign_id
    let charCount = 0
    do {
      if (firstSign === sign) break
      charCount += 1
    } while ((firstSign = this.get(firstSign).next_sign_ids[0]))
    return charCount
  }

  getSignInPrevLine(sign, scroll_version_id, col_id, line_id = undefined) {
    if (!line_id) line_id = this.lineFromSignID(sign, col_id, scroll_version_id)
    let pos = this.signPosInLine(sign, scroll_version_id, col_id, line_id)
    let prevLine = this.prevLineID(line_id, col_id, scroll_version_id)
    return {
      line_id: prevLine.line_id,
      sign_id: this.signAtPosInLine(scroll_version_id, prevLine.line_id, pos),
    }
  }

  getSignInNextLine(sign, scroll_version_id, col_id, line_id = undefined) {
    if (!line_id) line_id = this.lineFromSignID(sign, col_id, scroll_version_id)
    let pos = this.signPosInLine(sign, scroll_version_id, col_id, line_id)
    let nextLine = this.nextLineID(line_id, col_id, scroll_version_id)
    return {
      line_id: nextLine.line_id,
      sign_id: this.signAtPosInLine(scroll_version_id, nextLine.line_id, pos),
    }
  }

  signAtPosInLine(scroll_version_id, line_id, pos) {
    let sign_id = this.corpus.lines.get(line_id, scroll_version_id).line_sign_id
    let count = 0
    while (count < pos) {
      if (
        this.get(this.get(sign_id).next_sign_ids[0]) &&
        !this.get(this.get(sign_id).next_sign_ids[0]).line_id &&
        !(sign_id = this.get(sign_id).next_sign_ids[0])
      )
        break
      count += 1
    }
    return sign_id
  }
}
