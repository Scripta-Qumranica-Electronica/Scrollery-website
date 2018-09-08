import ItemList from './ItemList.js'
import SignCharCommentary from './SignCharCommentary.js'

export default class SignCharCommentaries extends ItemList {
  constructor(corpus, idKey, defaultPostData = undefined) {
    idKey = idKey || 'sign_char_commentary_id'
    const listType = 'sign_char_commentary_ids'
    const connectedLists = [corpus.signchars]
    const relativeToScrollVersion = true
    defaultPostData = defaultPostData ? defaultPostData : { transaction: 'getCommentaryOfSignChar' }
    super(
      corpus,
      idKey,
      SignCharCommentary,
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
