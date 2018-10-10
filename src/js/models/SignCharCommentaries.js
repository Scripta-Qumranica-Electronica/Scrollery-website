import ItemList from './ItemList.js'
// import SignCharCommentary from './SignCharCommentary.js'

export default class SignCharCommentaries extends ItemList {
  constructor(corpus, idKey, defaultPostData = undefined) {
    idKey = idKey || 'sign_char_commentary_id'
    const listType = 'sign_char_commentary_ids'
    const connectedLists = [corpus.signchars]
    const relativeToScrollVersion = true
    defaultPostData = defaultPostData
      ? defaultPostData
      : { transaction: 'requestCommentaryOfSignChar' }
    super(
      corpus,
      idKey,
      // SignCharCommentary,
      listType,
      connectedLists,
      relativeToScrollVersion,
      defaultPostData
    )
  }

  formatRecord(record) {
    return {
      sign_char_commentary_id: ~~record.sign_char_commentary_id, // Ensure positive integer with bitwise operator
      sign_char_id: ~~record.sign_char_id, // Ensure positive integer with bitwise operator
      attribute_id: ~~record.attribute_id, // Ensure positive integer with bitwise operator
      scroll_version_id: ~~record.scroll_version_id, // Ensure positive integer with bitwise operator
      commentary: record.commentary,
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
