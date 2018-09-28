import ItemList from './ItemList.js'
// import SignChar from './SignChar.js'

export default class SignChars extends ItemList {
  constructor(corpus, idKey, defaultPostData = undefined) {
    idKey = idKey || 'sign_char_id'
    const listType = 'sign_char_ids'
    const connectedLists = [corpus.signs]
    const relativeToScrollVersion = false
    defaultPostData = defaultPostData ? defaultPostData : { transaction: 'requestCharofSign' }
    super(corpus, idKey, listType, connectedLists, relativeToScrollVersion, defaultPostData)

    this.socket.on('finishAddSignAttribute', msg => {
      this.corpus.response(this.finishAddSignAttribute(msg))
    })

    this.socket.on('finishRemoveSignAttribute', msg => {
      this.corpus.response(this.finishRemoveSignAttribute(msg))
    })
  }

  formatRecord(record) {
    return {
      sign_char_id: ~~record.sign_char_id, // Ensure positive integer with bitwise operator
      sign_id: ~~record.sign_id, // Ensure positive integer with bitwise operator
      is_variant: record.is_variant || 0,
      char: record.char,
      // We don't bother sending the attribute value from the server if it is 1.
      // So if there is an actual char, we need to add the atribute value 1 (=LETTER).
      attribute_values:
        record.char !== '' ? [...record.attribute_values, { value: 1 }] : record.attribute_values,
      rois: record.rois || [],
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

  addSignAttribute(
    sign_char_id,
    scroll_version_id,
    attribute_value_id,
    sequence = 1,
    attribute_numeric_value = null
  ) {
    this.corpus.request('addSignAttribute', {
      scroll_version_id: scroll_version_id,
      signs: [
        {
          sign_char_id: sign_char_id,
          attributes: [
            {
              attribute_value_id: attribute_value_id,
              sequence: sequence,
              attribute_numeric_value: attribute_numeric_value,
            },
          ],
        },
      ],
    })
  }

  finishAddSignAttribute(msg) {
    return new Promise(resolve => {
      const results = msg[0]
      for (let i = 0, sign; (sign = msg.results[i]); i++) {
        for (let sign_char_id in sign) {
          for (let j = 0, attribute; (attribute = sign[sign_char_id][j]); j++) {
            for (let attr_key in attribute) {
              const updatedSignCharAttrs =
                this.get(sign_char_id, msg.payload.scroll_version_id) &&
                this.get(sign_char_id, msg.payload.scroll_version_id).attribute_values
              if (updatedSignCharAttrs) {
                updatedSignCharAttrs.push({
                  value: attribute[attr_key].attribute_value,
                  sign_char_attribute_id: ~~attr_key,
                })
                this.alterItemAtKey(
                  sign_char_id,
                  { attribute_values: updatedSignCharAttrs },
                  msg.payload.scroll_version_id
                )
              }
            }
          }
        }
      }
      resolve(msg)
    })
  }

  removeSignAttribute(sign_char_id, scroll_version_id, sign_char_attribute_id) {
    this.corpus.request('removeSignAttribute', {
      scroll_version_id: scroll_version_id,
      signs: [
        {
          sign_char_id: sign_char_id,
          attributes: [
            {
              sign_char_attribute_id: sign_char_attribute_id,
            },
          ],
        },
      ],
    })
  }

  finishRemoveSignAttribute(msg) {
    return new Promise(resolve => {
      for (let i = 0, sign; (sign = msg.results[i]); i++) {
        for (let sign_char_id in sign) {
          for (let j = 0, attribute; (attribute = sign[sign_char_id][j]); j++) {
            for (let attr_key in attribute) {
              if (attribute[attr_key] === 'deleted') {
                const updatedSignCharAttrs =
                  this.get(sign_char_id, msg.payload.scroll_version_id) &&
                  this.get(sign_char_id, msg.payload.scroll_version_id).attribute_values
                if (updatedSignCharAttrs) {
                  const delAttribute = updatedSignCharAttrs.find(
                    x => x.sign_char_attribute_id === ~~attr_key
                  )
                  if (delAttribute) {
                    updatedSignCharAttrs.splice(updatedSignCharAttrs.indexOf(delAttribute), 1)
                    this.alterItemAtKey(
                      sign_char_id,
                      { attribute_values: updatedSignCharAttrs },
                      msg.payload.scroll_version_id
                    )
                  }
                }
              }
            }
          }
        }
      }
      resolve(msg)
    })
  }
}
