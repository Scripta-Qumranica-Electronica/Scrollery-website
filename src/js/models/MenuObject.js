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
  constructor($post, id, set, itemIDKey, ajaxPayload, items = {}, itemList = []) {
    this.$post = $post // axios post functionality
    this._id = id
    this.set = set || ((object, key, value) => { object[key] = value })
    this._itemIDKey = itemIDKey
    this._hash = ''
    this._items = items
    this._itemList = itemList
    this._ajaxPayload = ajaxPayload

    this.populate()
  }

  /**
   * Destroy and clean up memory
   * 
   * @public
   * @instance
   */
  destroy() {
    for (var i = 0, n = this._itemList.length; i < n; i++) {
      this._itemList[i].destroy()
      delete this._itemList[i]
    }
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
  insert(item, index = -1) {
    // if (!(item instanceof this.constructor.getModel())) {
    //   throw new TypeError(`Expect an instance of ${this.constructor.getModel().name} in List.prototype.insert`)
    // }

    this._setItem(item[this._itemIDKey], item)
    this._insertItem(item[this._itemIDKey], index)
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

  changeItemValue(id, value, name) {
    this.set(this._items[id], value, name)
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

  populate() {
    this.$post('resources/cgi-bin/scrollery-cgi.pl', this._ajaxPayload)
        .then(res => {
            if (res.status === 200 && res.data) {

                // We can store hashes for the returned data
                // in the future, so we can avoid unnecessary
                // data transmission.
                this._hash = res.data.hash

                res.data.results.forEach(item => {
                    this.insert(item)
                });
            }
        })
        .catch(console.error)
  }
}

export default MenuObject