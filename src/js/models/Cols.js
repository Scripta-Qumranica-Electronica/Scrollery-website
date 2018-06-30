import ItemList from './ItemList.js'
import Col from './Col.js'

export default class Cols extends ItemList {
  constructor(corpus, idKey, defaultPostData = undefined) {
    idKey = idKey || 'col_id'
    const listType = 'cols'
    const connectedLists = [corpus.combinations]
    const relativeToScrollVersion = true
    defaultPostData = defaultPostData ? defaultPostData : { transaction: 'getColOfComb' }
    super(corpus, idKey, Col, listType, connectedLists, relativeToScrollVersion, defaultPostData)
  }

  removeItem(key, scroll_version_id = undefined) {
    /**
     * Add axios command to remove from database.
     * run super on successful completion.
     */
    super.removeItem(key, scroll_version_id)
  }
}
