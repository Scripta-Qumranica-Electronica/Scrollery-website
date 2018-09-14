import ItemList from './ItemList.js'
/**
 * This is exactly the same as ItemList except that
 * it maintains an array `_items` that lists all
 * the keys of `_itemOrder` in their desired order.
 * It manages insertion and removal of keys in a
 * syncronized system.
 */

export default class ItemListOrdered extends ItemList {
  constructor(
    corpus,
    idKey,
    listType,
    connectedLists,
    relativeToScrollVersion = false,
    defaultPostData = undefined
  ) {
    super(corpus, idKey, listType, connectedLists, relativeToScrollVersion, defaultPostData)
    this._itemOrder = []
  }

  _insertItem(item, scroll_version_id = undefined, position = undefined) {
    if (position === undefined) {
      position = this._itemOrder.length
    } else if (position > this._itemOrder.length) {
      throw new TypeError(`Requested position exceeds length of array: ${this._itemOrder.length}.`)
    }
    const key = this._formatKey(item[this.idKey], scroll_version_id)
    if (!(key in this._items) || this.get(key) !== item) {
      this._items = Object.assign({}, this._items, { [key]: item })
      this.splice(position, 0, key)
    }
  }

  /**
   * We don't use this yet, but it might give a small performance
   * boost when adding many objects sequentially.
   */
  /* istanbul ignore next */
  _insertItemAsNext(item, key) {
    this._items = Object.assign({}, this._items, { [key]: item })
    this._itemOrder.push(key)
  }

  /* istanbul ignore next */
  _removeItem(key, scroll_version_id = undefined) {
    key = this._formatKey(key, scroll_version_id)
    const arrayIndex = this._itemOrder.indexOf(key)
    if (arrayIndex !== -1) {
      this._itemOrder.splice(arrayIndex, 1)
    } else {
      throw new TypeError(`Key ${key} does not exist in itemOrder Array.`)
    }

    super._removeItem(key)
  }

  keys() {
    return this._itemOrder
  }

  /* istanbul ignore next */
  getIndexOfKey(key, scroll_version_id = undefined) {
    key = this._formatKey(key, scroll_version_id)
    return this._itemOrder.indexOf(key) !== -1 ? this._itemOrder.indexOf(key) : undefined
  }

  /* istanbul ignore next */
  splice(index, howmany, item) {
    this._itemOrder.splice(index, howmany, item)
  }

  /* istanbul ignore next */
  populate(postData) {
    postData = Object.assign({}, this.defaultPostData, postData)
    if (!postData) throw new TypeError(`No payload for POST request is available.`)
    return new Promise((resolve, reject) => {
      try {
        this.axios.post('resources/cgi-bin/scrollery-cgi.pl', postData).then(res => {
          if (res.data.results) {
            const temporaryList = {}
            const temporaryOrder = []
            const scroll_version_id = res.data.payload.scroll_version_id
            for (let i = 0, record; (record = res.data.results[i]); i++) {
              const recordKey =
                this.relativeToScrollVersion && scroll_version_id !== undefined
                  ? scroll_version_id + '-' + record[this.idKey]
                  : record[this.idKey]
              record = this.formatRecord(record)
              temporaryList[recordKey] = record
              temporaryOrder.push(recordKey)
              this.propagateAddData(record[this.idKey], res.data.payload)
            }
            this._items = Object.assign({}, this._items, temporaryList)
            for (let i = 0, newItem; (newItem = temporaryOrder[i]); i++) {
              if (this._itemOrder.indexOf(newItem) === -1) {
                this._itemOrder.push(newItem)
              }
            }
            resolve(res)
          } else {
            reject(res)
          }
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * This function should be run whenever a "populate"
   * message is sent from the server.
   */
  /* istanbul ignore next */
  processPopulate(message) {
    if (message.results) {
      const temporaryList = {}
      const temporaryOrder = []
      const scroll_version_id = message.payload && message.payload.scroll_version_id
      for (let i = 0, record; (record = message.results[i]); i++) {
        const recordKey =
          this.relativeToScrollVersion && scroll_version_id !== undefined
            ? scroll_version_id + '-' + record[this.idKey]
            : record[this.idKey]
        record = this.formatRecord(record)
        temporaryList[recordKey] = record
        temporaryOrder.push(recordKey)
        this.propagateAddData(record[this.idKey], message.payload)
      }
      this._items = Object.assign({}, this._items, temporaryList)
      for (let i = 0, newItem; (newItem = temporaryOrder[i]); i++) {
        if (this._itemOrder.indexOf(newItem) === -1) {
          this._itemOrder.push(newItem)
        }
      }
    } else {
      console.error('Could not process message:', message)
    }
  }
}
