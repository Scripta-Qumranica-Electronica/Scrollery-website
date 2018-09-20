import ItemList from './ItemList.js'

export default class Signs extends ItemList {
  constructor(corpus, idKey, defaultPostData = undefined) {
    idKey = idKey || 'sign_id'
    const listType = 'sign_ids'
    const connectedLists = [corpus.cols]
    const relativeToScrollVersion = false
    defaultPostData = defaultPostData ? defaultPostData : { transaction: 'getTextOfFragment' }
    super(corpus, idKey, listType, connectedLists, relativeToScrollVersion, defaultPostData)

    // Setup socket.io listeners
    this.socket.on('receiveTextOfFragment', msg => {
      this.corpus.response(this.processPopulate(msg))
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
      sign_chars: record.sign_chars || [],
    }
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
            this.processLine(line.signs, scroll_version_id, k).then(
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

  processLine(signs, scroll_version_id, count) {
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
            this.corpus.signs._items[sign_id] = this.formatRecord({
              sign_id: sign_id,
              next_sign_ids: sign.next_sign_ids,
              sign_chars: signChars,
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
        const signCharAttributes = [] //Could use propagateAddData, but this is probably faster
        signChars.push(sign_char_id)
        for (
          let n = 0, attribute;
          (attribute = Array.isArray(char.attributes) ? char.attributes[n] : [char.attributes][n]);
          n++
        ) {
          const sign_char_attribute_id = attribute.sign_char_attribute_id
          signCharAttributes.push(sign_char_attribute_id)
          let signCharAttributeValues = []
          for (
            let o = 0, value;
            (value = Array.isArray(attribute.values) ? attribute.values[o] : [attribute.values][o]);
            o++
          ) {
            signCharAttributeValues.push(value.attribute_value_id)
            if (value.attribute_value_id === 10) {
              // new line character
              line_sign_id = sign_id
            } else if (value.attribute_value_id === 12) {
              // new col character
              col_sign_id = sign_id
            }
          }
          // Create the attribute ...
          this.corpus.signCharAttributes._items[
            `${scroll_version_id}-${sign_char_attribute_id}`
          ] = this.corpus.signCharAttributes.formatRecord({
            scroll_version_id: scroll_version_id,
            sign_char_attribute_id: sign_char_attribute_id,
            sequence: attribute.sequence,
            attribute_values: signCharAttributeValues,
            commentary_id: attribute.values.commentary_id,
          })
        }
        // Create signChar
        this.corpus.signChars._items[
          scroll_version_id + '-' + char.sign_char_id
        ] = this.corpus.signChars.formatRecord({
          sign_char_id: char.sign_char_id,
          is_variant: char.is_variant,
          char: char.sign_char,
          sign_char_attributes: signCharAttributes,
        })
      }
      resolve([signChars, line_sign_id, signCount, col_sign_id])
    })
  }

  /**
   * The following are a suite of signstream search functions.
   * They follow only the default stream now.  We should perhaps
   * add a reference system to track when the user is not following
   * the defaul stream (i.e., sign.next_sign_id[0])
   */

  /**
   * Get the next letter.
   *
   * The function returns an object with the line_id that
   * the next letter sign_id belongs to.
   */
  nextSignLetter(sign, scroll_version_id, col_id, line_id = undefined) {
    if (!line_id) line_id = this.lineFromSignID(sign, col_id, scroll_version_id)
    let sign_id = this.get(this.get(sign).next_sign_ids[0]) ? this.get(sign).next_sign_ids[0] : sign
    if (this.signIsLineStart(sign_id, scroll_version_id)) {
      line_id = this.get(sign_id).line_id
      sign_id = this.get(this.get(sign_id).next_sign_ids[0])
        ? this.get(sign_id).next_sign_ids[0]
        : sign
    }
    return { line_id: line_id, sign_id: sign_id }
  }

  /**
   * Get the previous letter.
   *
   * You have to provide a col_id that you know is linked to the sign.
   * You can also provide a line_id to make the search faster.
   * This returns both the previous sign id and the last line_id
   * in an Object.
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

  signIsLineStart(sign, scroll_version_id) {
    return (
      []
        .concat(
          ...this.corpus.signChars
            .get(this.get(sign).sign_chars[0], scroll_version_id)
            .sign_char_attributes.map(
              a => this.corpus.signCharAttributes.get(a, scroll_version_id).attribute_values
            )
        )
        .indexOf(10) > -1
    )
  }

  lineFromSignID(sign_id, col_id, scroll_version_id) {
    let line_id = undefined
    let sign =
      this.corpus.cols.get(col_id, scroll_version_id) &&
      this.corpus.cols.get(col_id, scroll_version_id).col_sign_id
    if (sign) {
      while ((sign = this.get(sign).next_sign_ids[0])) {
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
            .get(this.get(sign).sign_chars[0], scroll_version_id)
            .sign_char_attributes.map(
              a => this.corpus.signCharAttributes.get(a, scroll_version_id).attribute_values
            )
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
