import ItemList from './ItemList.js'
// import SignChar from './SignChar.js'

export default class SignChars extends ItemList {
  constructor(corpus, idKey, defaultPostData = undefined) {
    idKey = idKey || 'sign_char_id'
    const listType = 'sign_char_ids'
    const connectedLists = [corpus.signs]
    const relativeToScrollVersion = false
    defaultPostData = defaultPostData ? defaultPostData : { transaction: 'getCharofSign' }
    super(
      corpus,
      idKey,
      // SignChar,
      listType,
      connectedLists,
      relativeToScrollVersion,
      defaultPostData
    )
  }

  formatRecord(record) {
    return {
      sign_char_id: ~~record.sign_char_id,
      is_variant: record.is_variant || 0,
      char: record.char,
      sign_char_attributes: record.sign_char_attributes || [],
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
