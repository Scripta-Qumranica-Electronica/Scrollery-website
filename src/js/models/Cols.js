import ItemListOrdered from './ItemListOrdered.js'
// import Col from './Col.js'

export default class Cols extends ItemListOrdered {
  constructor(corpus, idKey, defaultPostData = undefined) {
    idKey = idKey || 'col_id'
    const listType = 'cols'
    const connectedLists = [corpus.combinations,]
    const relativeToScrollVersion = true
    defaultPostData = defaultPostData ? defaultPostData : { transaction: 'requestColOfComb' }
    super(corpus, idKey, listType, connectedLists, relativeToScrollVersion, defaultPostData)

    // Setup socket.io listeners
    this.socket.on('receiveColOfComb', msg => {
      this.corpus.response(this.processPopulate(msg))
    })
  }

  formatRecord(record) {
    return {
      name: record.name,
      col_id: ~~record.col_id, // Ensure positive integer with bitwise operator
      scroll_version_id: ~~record.scroll_version_id, // Ensure positive integer with bitwise operator
      lines: record.lines || [],
      rois: record.rois || [],
      col_sign_id: ~~record.col_sign_id, // Ensure positive integer with bitwise operator
      sign_ids: record.signs || [],
    }
  }

  /* istanbul ignore next */
  updateName(item_id, name, scroll_version_id) {
    return super.updateName(item_id, name, scroll_version_id, 'changeColName')
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
