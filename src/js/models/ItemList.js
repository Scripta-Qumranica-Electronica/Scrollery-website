export default class ItemList {
  constructor(
    corpus,
    idKey,
    recordModel,
    listType,
    connectedLists,
    relativeToScrollVersion = false,
    defaultPostData = undefined
  ) {
    this.corpus = corpus
    this.idKey = idKey
    this._hash = undefined
    this._items = {}
    this._itemOrder = []
    this.recordModel = recordModel
    this.listType = listType
    this.connectedLists = connectedLists
    this.relativeToScrollVersion = relativeToScrollVersion
    this.defaultPostData = defaultPostData
    this.axios = this.corpus.axios
  }

  _insertItem(item, scroll_version_id = undefined, position = undefined) {
    //This check is probably a waste of time
    if (!(item instanceof this.recordModel)) {
      throw new TypeError(`Expected item to be an instance of ${this.recordModel.name}.`)
    }

    if (position === undefined) {
      position = this._itemOrder.length
    } else if (position > this._itemOrder.length) {
      throw new TypeError(`Requested position exceeds length of array: ${this._itemOrder.length}.`)
    }

    const key = this._formatKey(item[this.idKey], scroll_version_id)
    if (!(key in this._items) || this.get(key) !== item) {
      this._items = Object.assign({}, this._items, { [key]: item })
      this._itemOrder.splice(position, 0, key)
    }
  }

  _replaceItem(item, scroll_version_id = undefined) {
    //This check is probably a waste of time
    if (!(item instanceof this.recordModel)) {
      throw new TypeError(`Expected item to be an instance of ${this.recordModel.name}.`)
    }

    this.alterItemAtKey(item[this.idKey], item, scroll_version_id)
  }

  /**
   *
   * @param {Number/String} key of the record to be altered
   * @param {Object} newData to be inserted
   * @param {Number} scroll_version_id of the key, if present
   *                 the key will be automatically updated.
   */
  alterItemAtKey(key, newData, scroll_version_id = undefined) {
    key = this._formatKey(key, scroll_version_id)
    if (key in this._items) {
      const updatedItem = Object.assign({}, this.get(key), newData)
      this._items = Object.assign({}, this._items, { [key]: updatedItem })
    } else {
      throw new TypeError(`Item ${key} not found.`)
    }
  }

  /**
   *
   * Some ItemList objects will have items containing id's for linked
   * data.  This function will add the id for one or more of those
   * relational links to the item specified as the "key".
   *
   * @param {Number/String}       key           key of the record to be altered
   * @param {String}              sublistName   name of the list to be altered
   *                                            within the specified item.
   * @param {Array/String/Number} newData       the id(s) for the linked data
   *                                            to be inserted into the sublist.
   *                                            This is automatically converted to
   *                                            an Array if it isn't one already.
   * @param {Number}              scroll_version_id of the key, if present the key will be automatically updated.
   */
  addToItemSublist(key, sublistName, newData, scroll_version_id = undefined) {
    key = this._formatKey(key, scroll_version_id)
    // Wrap newData in an array if it isn't already
    newData = Array.isArray(newData) ? newData : [newData]
    if (key in this._items) {
      const updateItem = this.get(key)
      for (let i = 0, newDatum; (newDatum = newData[i]); i++) {
        if (updateItem[sublistName].indexOf(newDatum) === -1) {
          updateItem[sublistName].push(newDatum)
        }
      }
      this.alterItemAtKey(key, updateItem)
    } else {
      throw new TypeError(`Item ${key} not found.`)
    }
  }

  /**
   *
   * Some ItemList objects will have items containing id's for linked
   * data.  This function will remove the id for one or more of those
   * relational links from the item specified as the "key".
   *
   * @param {Number/String}       key           key of the record to be altered
   * @param {String}              sublistName   name of the list to be altered
   *                                            within the specified item.
   * @param {Array/String/Number} newData       the id(s) for the linked data
   *                                            to be inserted into the sublist.
   *                                            This is automatically converted to
   *                                            an Array if it isn't one already.
   * @param {Number}              scroll_version_id of the key, if present the key will be automatically updated.
   */
  removeItemFromSublist(key, sublistName, newData, scroll_version_id = undefined) {
    key = this._formatKey(key, scroll_version_id)
    // Wrap newData in an array if it isn't already
    newData = Array.isArray(newData) ? newData : [newData]
    if (key in this._items) {
      const updateItem = this.get(key)
      for (let i = 0, newDatum; (newDatum = newData[i]); i++) {
        let index = updateItem[sublistName].indexOf(newDatum)
        if (index !== -1) {
          updateItem[sublistName].splice(index, 1)
        }
      }
      this.alterItemAtKey(key, updateItem)
    } else {
      throw new TypeError(`Item ${key} not found.`)
    }
  }

  _removeItem(key, scroll_version_id = undefined) {
    key = this._formatKey(key, scroll_version_id)
    const arrayIndex = this._itemOrder.indexOf(key)
    if (arrayIndex !== -1) {
      this._itemOrder.splice(arrayIndex, 1)
    } else {
      throw new TypeError(`Key ${key} does not exist in itemOrder Array.`)
    }

    if (key in this._items) {
      delete this._items[key]
    } else {
      throw new TypeError(`Key ${key} does not exist in items Object.`)
    }
  }

  /**
   *
   * This is the public access to the private function.
   * It may be overridden by the classes that
   * inherit this class.
   *
   * @param {String or Number} key of the item to be deleted.
   * @param {Number} scroll_version_id that the item belongs to/
   */
  removeItem(key, scroll_version_id = undefined) {
    key = this._formatKey(key, scroll_version_id)
    for (let i = 0, list; (list = this.connectedLists[i]); i++) {
      const listKey = this.get(key)[list.idKey]
      list.removeItemFromSublist(listKey, this.listType, key)
    }
    this._removeItem(key)
  }

  get(key, scroll_version_id = undefined) {
    key = this._formatKey(key, scroll_version_id)
    return this._items[key] ? this._items[key] : undefined
  }

  getIndexOfKey(key, scroll_version_id = undefined) {
    key = this._formatKey(key, scroll_version_id)
    return this._itemOrder.indexOf(key) !== -1 ? this._itemOrder.indexOf(key) : undefined
  }

  keys() {
    return this._itemOrder
  }

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
              const recordKey = this.relativeToScrollVersion
                ? scroll_version_id + '-' + record[this.idKey]
                : record[this.idKey]
              record = new this.recordModel(record)
              temporaryList[recordKey] = record
              temporaryOrder.push(recordKey)
              this.propagateAddData(recordKey, res.data.payload, scroll_version_id)
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
   * This function will propagate the relational from
   * populate to the proper entries in other lists.
   */
  propagateAddData(data, payload) {
    for (let i = 0, list; (list = this.connectedLists[i]); i++) {
      const key = payload[list.idKey]
      const scroll_version_id = list.relativeToScrollVersion ? payload.scroll_version_id : undefined
      list.addToItemSublist(key, this.listType, data, scroll_version_id)
    }
  }

  _formatKey(key, scroll_version_id = undefined) {
    return scroll_version_id ? scroll_version_id + '-' + key : key
  }
}
