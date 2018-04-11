import axios from 'axios'

/* TODO I ignore this for testing until I decide on
 * a set model.  Write tests when that has been
 * determined!
 */

/* istanbul ignore next */

/**
 * A base data model for menu items,
 * including relevant business logic.
 * 
 * It stores keys-value pairs for each subcomponent,
 * and an array of those keys for sorting.
 * 
 * It contains several methods that can be overridden
 * to ensure reactivity in whatever framework might
 * be in use.
 * 
 * The basic structure is:
 * {
 *    id: int,
 *    hash: String, // For sync lookups later
 *    items: {
 *              1: {attrs...},
 *              2: {attrs...},
 *              3: {attrs...},
 *              ...,
 *           },
 *    itemList: [1,3,2, ...],
 * }
 */
class MenuObject {
  constructor(sessionID, user, set, itemIDKey, ajaxPayload) {
    this.sessionID = sessionID // axios post functionality
    this.user = user
    this.set = set || ((object, key, value) => { object[key] = value }) // This allows you to pass a custom data setter [for proper reactivity]
    this.itemIDKey = itemIDKey // This is must match the key of the UID returned from the database for this data item (version_id for combinations, image_catalog_id for images, etc.)
    this._ajaxPayload = Object.assign(
      {}, 
      ajaxPayload, 
      {SESSION_ID: this.sessionID}
    )

    this._hash = ''
    this._items = {}
    this._itemList = []
  }

  /**
   * Destroy and clean up memory
   * 
   * @public
   * @instance
   */
  destroy() {
    this._itemList.length = 0
    delete this._itemList

    for (var key in this._items) {
        if (this._items.hasOwnProperty(key)) {
            this._items[key].destroy()
            delete this._items[key]
        }
    }
    delete this._items

    delete this._hash
    delete this._id
  }

  /**
   * @public 
   * @instance
   * 
   * @return {Array<Number>}       list of all items
   */
  items() {
    return (this._itemList)
  }

  /**
   * @public 
   * @instance
   * 
   * @param {number} index the item index to retrieve 
   * 
   * @return {Model}       the Model object
   */
  itemAtIndex(index) {
    return (this._items[this._itemList[index]] || null)
  }

  /**
   * @public 
   * @instance
   * 
   * @param {number} index the item index to retrieve 
   * 
   * @return {Model}       the Model object
   */
  itemWithID(id) {
    return (this._items[id] || null)
  }

  items() {
      return this._items
  }

  /**
   * @public
   * @instance
   * 
   * @param {Model}     item    A list item to insert
   * @param {number=-1} index   The index at which to insert the list, defaults to the end
   */
  _newItem(item, index = -1) {
    this._setItem(item[this.itemIDKey], item)
    this._insertItem(item[this.itemIDKey], index)
  }

  /**
   * @private
   * @instance
   * 
   * @param {Model}     item    A menu item to insert
   * @param {number}    id      The unique identifier of the menu item
   * 
   * This function should be overridden by whatever setter method
   * will ensure reactivity in the current framework (e.g., Vue.set() in Vue.js)
   */
  _setItem(id, item) {
    this.set(this._items, id, item)
  }

  /**
   * @private
   * @instance
   * 
   * @param {number} id      The unique identifier of the menu item
   * @param {number} index   The index at which to insert the list, defaults to the end
   * 
   * This function should be overridden by whatever insert method
   * will ensure reactivity in the current framework (e.g., Vue.set() in Vue.js)
   */
  _insertItem(id, index) {
    index === -1

      // insert a item at the end when no number specified
      ? this._itemList.push(id)

      // otherwise, insert at specified location
      : this._itemList.splice(index, 0, id)
  }

  changeItemValue(id, key, value) {
    this.set(this._items[id], key, value)
  }

  /**
   * @param {number} index   index of the item to remove
   */
  deleteIndex(index) {
    delete this._itemList[index]
    this._deleteItem(this._itemList[index])
    this._removeItem(index)
  }

  /**
   * @private
   * @instance
   * 
   * @param {number}    id      The unique identifier of the menu item
   * 
   * This function should be overridden by whatever setter method
   * will ensure reactivity in the current framework (e.g., Vue.del() in Vue.js)
   */
  _deleteItem(itemID) {
    this._items[itemID].destroy()
    delete this._items[itemID]
  }

  /**
   * @private
   * @instance
   * 
   * @param {number} index   The index at which to insert the list, defaults to the end
   * 
   * This function should be overridden by whatever insert method
   * will ensure reactivity in the current framework (e.g., Vue.del() in Vue.js)
   */
  _removeItem(index) {
    this._itemList[index] && this._itemList.splice(index, 1)
  }

  /**
   * @public
   * @instance
   * 
   * @return {number} the number of items
   */
  count() {
    return this._itemList.length;
  }

  /**
   * @public
   * @instance
   * 
   * @param {function} cb       A callback that receives each item and index
   * @param {object}   context  The context within which to run the callback
   */
  forEach(cb, context = null) {
    for (let i = 0, n = this._itemList.length; i < n; i++) {
      context
        ? cb(this._items[this._itemList[i]], i, this._itemList)
        : cb.call(context, this._items[this._itemList[i]], i, this._itemList)
    }
  }

  populate(customPayload) {
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

              res.data.results.forEach(item => {
                if (!this._items[item[this.itemIDKey]] || this._items[item[this.itemIDKey]] !== item) {
                  this._newItem(item)
                }
              })
              resolve(res.data.results)
            }
        })
      } catch (err) {
          reject(err);
      }
    })
  }
}

export default MenuObject