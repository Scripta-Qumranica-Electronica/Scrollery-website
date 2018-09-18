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
          ([signChars, line_sign_id, signCount, col_sign_id]) => {
            // Create sign
            this.corpus.signs._items[sign_id] = this.formatRecord({
              sign_id: sign_id,
              next_sign_ids: sign.next_sign_ids,
              sign_chars: signChars,
            })
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
          const attribute_id = attribute.attribute_id
          signCharAttributes.push(attribute_id)
          // Create the attribute ...
          this.corpus.signCharAttributes._items[
            scroll_version_id + '-' + attribute_id
          ] = this.corpus.signCharAttributes.formatRecord({
            sign_char_attribute_id: attribute_id,
            sequence: attribute.sequence,
            attribute_name: attribute.attribute_name,
            attribute_values: attribute.values,
            commentary_id: attribute.values.commentary_id,
          })
          for (
            let o = 0, value;
            (value = Array.isArray(attribute.values) ? attribute.values[o] : [attribute.values][o]);
            o++
          ) {
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
          sign_char_attributes: signCharAttributes,
        })
      }
      resolve([signChars, line_sign_id, signCount, col_sign_id])
    })
  }
}
