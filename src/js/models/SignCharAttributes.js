import ItemList from './ItemList.js'
import SignCharAttribute from './SignCharAttribute.js'

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
      SignCharAttribute,
      listType,
      connectedLists,
      relativeToScrollVersion,
      defaultPostData
    )
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
