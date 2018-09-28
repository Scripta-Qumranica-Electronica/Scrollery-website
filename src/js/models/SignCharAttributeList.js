import ItemList from './ItemList.js'

export default class SignCharAttributeList extends ItemList {
  constructor(corpus, idKey, defaultPostData = undefined) {
    idKey = idKey || 'attribute_value_id'
    const listType = 'attribute_value_ids'
    const connectedLists = []
    const relativeToScrollVersion = false
    defaultPostData = defaultPostData ? defaultPostData : { transaction: 'requestListOfAttributes' }
    super(corpus, idKey, listType, connectedLists, relativeToScrollVersion, defaultPostData)

    // Setup socket.io listeners
    this.socket.on('receiveListOfAttributes', msg => {
      this.corpus.response(this.processPopulate(msg))
    })
  }

  formatRecord(record) {
    return {
      attribute_value_id: ~~record.attribute_value_id, // Ensure positive integer with bitwise operator
      attribute_value_name: record.attribute_value_name,
      attribute_value_description: record.attribute_value_description,
      attribute_id: ~~record.attribute_id, // Ensure positive integer with bitwise operator
      attribute_name: record.attribute_name,
      attribute_description: record.attribute_description,
      type: record.type,
    }
  }

  getAttributes() {
    let attributes = {}
    for (let key in Object.keys(this._items)) {
      attributes[this._items[key].attribute_id] = {
        name: this._items[key].attribute_name,
        attribute_description: this._items[key].attribute_description,
        type: this._items[key].type,
      }
    }
    return attributes
  }
}
