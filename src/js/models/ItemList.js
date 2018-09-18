/**
 * This is an abstact object used for the other data model/controllers.
 * It has a subclassed ItemListOrdered, which maintains an array with the
 * order of elements in the object.
 *
 * Note that elements in `_items` are now object literals.
 * Originally we had used classes for each element, but this caused
 * a dramatic performance hit with very large data sets. (15–20 seconds to
 * add ~20,000 elements with Classes as opposed to ~40ms with onject
 * literals.)  Perhaps there is a compromise, but we need to test any proposed
 * strategy before implementation.
 */

export default class ItemList {
  constructor(
    corpus,
    idKey,
    listType,
    connectedLists,
    relativeToScrollVersion = false,
    defaultPostData = undefined
  ) {
    this.corpus = corpus
    this.idKey = idKey
    this._hash = undefined
    this._items = {}
    this.listType = listType
    this.connectedLists = connectedLists
    this.relativeToScrollVersion = relativeToScrollVersion
    this.defaultPostData = defaultPostData
    this.axios = this.corpus.axios // TODO remove this
    this.socket = this.corpus.socket
  }

  /**
   * We had originally used object classes to format the items that
   * go into _items, but this was quite expensive in Javascript.  So
   * we have switched to using object literals.  Using the formatRecord
   * function is a means to make that a bit safer.  Any item that
   * you want to add to _items should always be run through formatRecord
   * first, which will ensure that it has the expected attributes and
   * corresponding value types.  Note that this function is overridden
   * witha custom implementation in every subclass of ItemList.
   */
  formatRecord(input) {
    return input
  }

  _insertItem(item, scroll_version_id = undefined) {
    const key = this._formatKey(item[this.idKey], scroll_version_id)
    if (!(key in this._items) || this.get(key) !== item) {
      this._items = Object.assign({}, this._items, { [key]: item })
    }
  }

  _replaceItem(item, scroll_version_id = undefined) {
    this.alterItemAtKey(item[this.idKey], item, scroll_version_id)
  }

  /**
   *
   * @param {Number/String} key of the record to be altered
   * @param {Object} newData to be inserted
   * @param {Number} scroll_version_id of the key, if present
   *                 the key will be automatically updated.
   */
  /* istanbul ignore next */
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
  /* istanbul ignore next */
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
  /* istanbul ignore next */
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

  /* istanbul ignore next */
  _removeItem(key, scroll_version_id = undefined) {
    key = this._formatKey(key, scroll_version_id)
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
  /* istanbul ignore next */
  removeItem(key, scroll_version_id = undefined) {
    const formattedKey = this._formatKey(key, scroll_version_id)
    for (let i = 0, list; (list = this.connectedLists[i]); i++) {
      const listKey = this.get(formattedKey)[list.idKey]
      list.removeItemFromSublist(listKey, this.listType, key)
    }
    this._removeItem(formattedKey)
  }

  get(key, scroll_version_id = undefined) {
    key = this._formatKey(key, scroll_version_id)
    return this._items[key] ? this._items[key] : undefined
  }

  keys() {
    return this._items.keys()
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
            const scroll_version_id = res.data.payload.scroll_version_id
            for (let i = 0, record; (record = res.data.results[i]); i++) {
              const recordKey =
                this.relativeToScrollVersion && scroll_version_id !== undefined
                  ? scroll_version_id + '-' + record[this.idKey]
                  : record[this.idKey]
              record = this.formatRecord(record)
              temporaryList[recordKey] = record
              this.propagateAddData(record[this.idKey], res.data.payload)
            }
            this._items = Object.assign({}, this._items, temporaryList)
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

  requestPopulate(message, transaction = undefined) {
    if (!transaction) transaction = this.defaultPostData.transaction
    return this.corpus.request(
      transaction,
      Object.assign(
        {
          user_id: this.corpus.user,
        },
        message
      )
    )
  }

  /**
   * This function should be run whenever a "populate"
   * message is sent from the server.
   */
  /* istanbul ignore next */
  processPopulate(message) {
    return new Promise(resolve => {
      if (message.results) {
        const temporaryList = {}
        const scroll_version_id = message.payload && message.payload.scroll_version_id
        for (let i = 0, record; (record = message.results[i]); i++) {
          const recordKey =
            this.relativeToScrollVersion && scroll_version_id !== undefined
              ? scroll_version_id + '-' + record[this.idKey]
              : record[this.idKey]
          record = this.formatRecord(record)
          temporaryList[recordKey] = record
          this.propagateAddData(record[this.idKey], message.payload)
        }
        this._items = Object.assign({}, this._items, temporaryList)
        resolve(message)
      } else {
        console.error('Could not process message:', message)
        resolve(false)
      }
    })
  }

  //  TODO This must be wrong.  Fix when you have time, or remove.
  /* istanbul ignore next */
  updateName(item_id, name, scroll_version_id, transaction) {
    return new Promise((resolve, reject) => {
      if (
        (this.get(item_id) && this.get(item_id).name) ||
        (this.get(item_id, scroll_version_id) && this.get(item_id, scroll_version_id).name)
      ) {
        const oldName = this.relativeToScrollVersion
          ? this.get(item_id, scroll_version_id).name
          : this.get(item_id).name
        console.log(`Artefect name: ${name}`)
        const payload = {
          scroll_version_id: scroll_version_id,
          name: name,
          [this.idKey]: item_id,
          transaction: transaction,
        }
        this.alterItemAtKey(item_id, { name: name }, scroll_version_id)
        this.axios
          .post('resources/cgi-bin/scrollery-cgi.pl', payload)
          .then(res => {
            if (res.status === 200 && res.data) {
              resolve(res)
            } else {
              this.alterItemAtKey(artefact_id, { name: oldName }, scroll_version_id)
              reject(res)
            }
          })
          .catch(err => {
            this.alterItemAtKey(artefact_id, { name: oldName }, scroll_version_id)
            reject(err)
          })
      } else {
        reject(`Item ${item_id} doesn't exist or has no name field`)
      }
    })
  }

  /**
   * This function will propagate the relational from
   * populate to the proper entries in other lists.
   */
  /* istanbul ignore next */
  propagateAddData(data, payload) {
    for (let i = 0, list; (list = this.connectedLists[i]); i++) {
      const key = payload[list.idKey]
      const scroll_version_id = list.relativeToScrollVersion ? payload.scroll_version_id : undefined
      if (key !== undefined) list.addToItemSublist(key, this.listType, data, scroll_version_id)
    }
  }

  _formatKey(key, scroll_version_id = undefined) {
    return scroll_version_id ? scroll_version_id + '-' + key : key
  }
}
