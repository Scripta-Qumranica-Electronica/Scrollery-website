import { OrderedMap, Record } from 'immutable'
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
  constructor(sessionID, idKey, ajaxPayload, model, attributes = {}) {
    this._ajaxPayload = Object.assign({}, ajaxPayload, {SESSION_ID: sessionID})
    // todo: safety to ensure props not overwritten
    Object.assign(this, {timestamp: Date.now()}, attributes)
    this.idKey = idKey
    this._hash = undefined
    this._items = OrderedMap()
    this.model = model || Record
  }

  populate(customPayload = {}) {
    let payload = Object.assign(
      {}, 
      this._ajaxPayload, 
      customPayload
    )

    return new Promise((resolve, reject) => {
      try {
        axios.post('resources/cgi-bin/scrollery-cgi.pl', payload)
        .then(res => {
          if (res.status === 200 && res.data.results) {

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
            res.data.results.forEach(item => {
              if (!results[item.version_id] || results[item.version_id] !== item) {
                const record = new this.model(item)
                results.push([item[this.idKey], record])
              }
            })

            this._items = this._items.merge(results)
            resolve(res.data.results)
          }
        })
      } catch (err) {
          reject(err);
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
   * @returns {Record}  the record class itself
   */
  static getModel() {
    return Model
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
   * @param {number} key the item to retrieve 
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
  getFirstKey(){
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
    if (!(item instanceof this.constructor.getModel())) {
      throw new TypeError(`Expect an instance of ${this.constructor.getModel().name} in List.prototype.insert`)
    }

    beforeKey === -1

      // insert a item at the end of no number specified
      ? this._items = this._items.set(item[this.keyLabel], item)

      // otherwise, insert at specified location
      : this._items = _insertBefore(this._items, beforeKey, item[this.keyLabel], item)
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
    this._items[key] && (this._items = this._items.remove(key))
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
  find(cb) {
    return this._items.find(cb)
  }

  /**
   * Forward on to OrderedMap.prototype.findKey
   * 
   * @public
   * @instance
   * 
   * @param {function} cb A callback that returns truthy values when the item matches the criteria
   */
  findKey(cb) {
    return this._items.findKey(cb)
  }

  /**
   * Deep copy of the items map as a plain Object
   * 
   * @returns {Object} the items
   */
  items() {
    return this._items.toJS()
  }
}

export default MapList
