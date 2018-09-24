import ItemList from './ItemList.js'
// import SignChar from './SignChar.js'

export default class SignChars extends ItemList {
  constructor(corpus, idKey, defaultPostData = undefined) {
    idKey = idKey || 'sign_char_id'
    const listType = 'sign_char_ids'
    const connectedLists = [corpus.signs]
    const relativeToScrollVersion = false
    defaultPostData = defaultPostData ? defaultPostData : { transaction: 'getCharofSign' }
    super(corpus, idKey, listType, connectedLists, relativeToScrollVersion, defaultPostData)
  }

  formatRecord(record) {
    return {
      sign_char_id: ~~record.sign_char_id, // Ensure positive integer with bitwise operator
      is_variant: record.is_variant || 0,
      char: record.char,
      // We don't bother sending the attribute value from the server if it is 1.
      // So if the length of attribute_values === 0, the assign a single attribute
      // with a value of 1.
      attribute_values:
        record.attribute_values.length === 0 ? [{ value: 1 }] : record.attribute_values,
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
}
