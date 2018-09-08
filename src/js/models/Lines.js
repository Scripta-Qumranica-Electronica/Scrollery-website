import ItemList from './ItemList.js'
import Line from './Line.js'

export default class TextLines extends ItemList {
  constructor(corpus, idKey, defaultPostData = undefined) {
    idKey = idKey || 'line_id'
    const listType = 'lines'
    const connectedLists = [corpus.combinations]
    const relativeToScrollVersion = true
    defaultPostData = defaultPostData ? defaultPostData : { transaction: 'getLineOfCol' }
    super(corpus, idKey, Line, listType, connectedLists, relativeToScrollVersion, defaultPostData)
  }

  /* istanbul ignore next */
  updateName(item_id, name, scroll_version_id) {
    return super.updateName(item_id, name, scroll_version_id, 'changeLineName')
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
