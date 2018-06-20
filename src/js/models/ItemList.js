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

    if (!position) {
      position = this._itemOrder.length
    } else if (position > this._itemOrder.length) {
      throw new TypeError(`Requested position exceeds length of array: ${this._itemOrder.length}.`)
    }

    const key = this._formatKey(item[this.idKey], scroll_version_id)
    if (!this.get(key) || this.get(key) !== item) {
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

  alterItemAtKey(key, newData, scroll_version_id = undefined) {
    key = this._formatKey(key, scroll_version_id)
    if (this.get(key)) {
      const updatedItem = Object.assign({}, this.get(key), newData)
      this._items = Object.assign({}, this._items, { [key]: updatedItem })
    } else {
      throw new TypeError(`Item ${key} not found.`)
    }
  }

  addToItemSublist(key, sublistName, newData, scroll_version_id = undefined) {
    key = this._formatKey(key, scroll_version_id)
    if (this.get(key)) {
      const updatedItem = this.get(key)
      newData = Array.isArray(newData) ? newData : [newData]
      for (let i = 0, newDatum; (newDatum = newData[i]); i++) {
        if (updatedItem[sublistName].indexOf(newDatum) === -1) {
          updatedItem[sublistName].push(newDatum)
        }
      }
      this._items = Object.assign({}, this._items, { [key]: updatedItem })
    } else {
      throw new TypeError(`Item ${key} not found.`)
    }
  }

  _removeItem(key, scroll_version_id = undefined) {
    key = this._formatKey(key, scroll_version_id)
    const arrayIndex = this._itemOrder.indexOf(key)
    if (arrayIndex !== -1) {
      this._itemOrder = this._itemOrder.splice(arrayIndex, 1)
    } else {
      throw new TypeError(`Key ${key} does not exist in itemOrder Array.`)
    }

    if (this.get(key)) {
      delete this._items[key]
    } else {
      throw new TypeError(`Key ${key} does not exist in items Object.`)
    }
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
            this._itemOrder = [...temporaryOrder, ...this._itemOrder]
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
    for (let i = 0, addList; (addList = this.connectedLists[i]); i++) {
      const key = payload[addList.idKey]
      const scroll_version_id = addList.relativeToScrollVersion
        ? payload.scroll_version_id
        : undefined
      if (this.relativeToScrollVersion) {
        addList.addToItemSublist(key, this.listType, data, scroll_version_id)
      } else {
        addList.addToItemSublist(key, this.listType, data, scroll_version_id)
      }
    }
  }

  _formatKey(key, scroll_version_id = undefined) {
    return scroll_version_id ? scroll_version_id + '-' + key : key
  }
}
