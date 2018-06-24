import { OrderedMap } from 'immutable'
import Record from './Record'
import axios from 'axios'

/**
 * A base class for lists of models. Mainly, this provides an interface to
 * work with an ordered array of child-items.
 *
 * It has a similar API as the array, but is more focused
 */
class MapList {
  /**
   * @param {object={}} [attributes] List attributes
   * @param {array=[]}  [items]      An initial array of items for the list
   */
  constructor(
    session_id,
    idKey,
    ajaxPayload,
    model,
    attributes = {},
    standardTransaction = undefined
  ) {
    this.session_id = session_id
    this._ajaxPayload = Object.assign({}, ajaxPayload, {
      SESSION_ID: this.session_id,
    })
    // todo: safety to ensure props not overwritten
    Object.assign(this, { timestamp: Date.now() }, attributes)
    this.idKey = idKey
    this._hash = undefined
    this._items = OrderedMap()
    this.model = model || Record
    this.standardTransaction = standardTransaction
  }

  // TODO: mocking for axios in unit test
  /* istanbul ignore next */
  populate(customPayload = {}, scrollVersionID = undefined) {
    let payload = Object.assign(
      {},
      this._ajaxPayload,
      customPayload,
      scrollVersionID && { scroll_version_id: scrollVersionID }
    )

    return new Promise((resolve, reject) => {
      try {
        axios.post('resources/cgi-bin/scrollery-cgi.pl', payload).then(res => {
          if (res.status === 200 && res.data.replies) {
            // We can store hashes for the returned data
            // in the future, so we can avoid unnecessary
            // data transmission.
            this._hash = res.data.hash

            // Note to self: if you load the data into a 2d array:
            // [[key1, value1],[key2,[value2]] the keys can be
            // loaded into an OrderedMap as integers.  If you use
            // an Object {key1: value1, key2: value2}, then the
            // keys are converted to strings.
            let results = []
            res.data.replies.forEach(reply => {
              if (reply.error) {
                return
              }

              reply.results.forEach(item => {
                let record
                if (this.get(item[this.idKey]) && this.get(item[this.idKey]).toJS() !== item) {
                  record = this.get(item[this.idKey]).extend(item)
                } else if (!this.get(item[this.idKey])) {
                  record = new this.model(item)
                }
                if (record) {
                  results.push([item[this.idKey], record])
                }
              })
            })

            this.merge(results)
            resolve(res.data.replies)
          }
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * Destroy and clean up memory
   *
   * @public
   * @instance
   */
  destroy() {
    // for (var i = 0, n = this._items.length; i < n; i++) {
    //   this._items[i].destroy()
    //   delete this._items[i]
    // }
    delete this._items
  }

  /**
   * @public
   * @instance
   *
   * @return {string} the list id
   */
  getTimestamp() {
    return this.timestamp
  }

  /**
   * @public
   * @instance
   *
   * @param {number} key of the item to retrieve
   *
   * @return {Model}       the Model object
   */
  get(key) {
    return this._items.get(key) || undefined
  }

  /**
   * @public
   * @instance
   *
   * @return {key}       the key of the first object in map
   */
  getFirstKey() {
    return this._items.keySeq().first()
  }

  /**
   * @public
   * @instance
   *
   * @param {Model}     item    A map item to insert
   * @param {number=-1} beforeKey   The key before which to insert the item, defaults to the end
   */
  insert(item, beforeKey = -1) {
    if (!(item instanceof this.model)) {
      throw new TypeError(
        `Expect an instance of ${this.model.name} in List.prototype.insert, not ${
          item.constructor.name
        }`
      )
    }

    beforeKey === -1
      ? // insert a item at the end of no number specified
        (this._items = this._items.set(item[this.idKey], item))
      : // otherwise, insert at specified location
        (this._items = this._insertBefore(this._items, beforeKey, item[this.idKey], item))
  }

  /**
   * @private
   * @instance
   *
   * @param {OrderedMap}     map    A map item to insert
   * @param {number}  index   The key before which to insert the item
   * @param {number}  key     The key of the item to be inserted
   * @param {Object}  val     The item to be inserted
   */
  _insertBefore(map, index, key, val) {
    return OrderedMap().withMutations(r => {
      for (const [k, v] of map.entries()) {
        if (index === k) {
          r.set(key, val)
        }
        r.set(k, v)
      }
    })
  }

  /**
   * @public
   * @instance
   *
   * @param {number} key the item to retrieve
   *
   * @return {Model}       the Model object
   */
  set(key, value) {
    this._items = this._items.set(key, value)
  }

  /**
   * @public
   * @instance
   *
   * @param {Object} map the map to merge into this object
   *
   */
  merge(map) {
    this._items = this._items.merge(map)
  }

  /**
   * @param {number} key   key of the item to remove
   */
  delete(key) {
    if (this._items[key]) this._items = this._items.delete(key)
  }

  /**
   * @public
   * @instance
   *
   * @return {number} the number of items
   */
  count() {
    return this._items.size
  }

  /**
   * @public
   * @instance
   *
   * @param {function} cb       A callback that receives each item and index
   * @param {object}   context  The context within which to run the callback
   */
  forEach(cb, context = null) {
    this._items.forEach(cb, context)
  }

  /**
   * Forward on to OrderedMap.prototype.find
   *
   * @public
   * @instance
   *
   * @param {function} cb A callback that returns truthy values when the item matches the criteria
   */
  // find(cb) {
  //   return this._items.find(cb)
  // }

  /**
   * Forward on to OrderedMap.prototype.findKey
   *
   * @public
   * @instance
   *
   * @param {function} cb A callback that returns truthy values when the item matches the criteria
   */
  // findKey(cb) {
  //   return this._items.findKey(cb)
  // }

  /**
   * Deep copy of the items map as a plain Object
   *
   * @returns {Object} the items
   */
  jsItems() {
    return this._items.toJS()
  }

  /**
   * Deep copy of the items map as a plain Object
   *
   * @returns {Object} the items
   */
  getItems() {
    return this._items
  }

  keys() {
    return this._items.keySeq().toArray()
  }
}

export default MapList