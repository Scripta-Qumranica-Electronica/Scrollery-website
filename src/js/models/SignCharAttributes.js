import ItemList from './ItemList.js'
// import SignCharAttribute from './SignCharAttribute.js'

export default class SignCharAttributes extends ItemList {
  constructor(corpus, idKey, defaultPostData = undefined) {
    idKey = idKey || 'sign_char_attribute_id'
    const listType = 'sign_char_attribute_ids'
    const connectedLists = [corpus.signchars]
    const relativeToScrollVersion = true
    defaultPostData = defaultPostData ? defaultPostData : { transaction: 'getAttributeOfSignChar' }
    super(
      corpus,
      idKey,
      // SignCharAttribute,
      listType,
      connectedLists,
      relativeToScrollVersion,
      defaultPostData
    )
  }

  formatRecord(record) {
    return {
      sign_char_attribute_id: ~~record.sign_char_attribute_id,
      scroll_version_id: ~~record.scroll_version_id,
      sequence: ~~record.sequence || 0,
      attribute_name: record.attribute_name,
      attribute_values: Array.isArray(record.attribute_values)
        ? record.attribute_values
        : [record.attribute_values],
      commentary_id: ~~record.commentary_id || 0,
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
