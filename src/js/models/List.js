import Model from './Model.js'

/**
 * A base class for lists of models. Mainly, this provides an interface to
 * work with an ordered array of child-items.
 * 
 * It has a similar API as the array, but is more focused
 */
class List {
  constructor(attributes, items = []) {

    // todp: safety to ensure props not overwritten
    Object.assign(this, attributes)

    this._items = items
  }

  /**
   * Destroy and clean up memory
   * 
   * @public
   * @instance
   */
  destroy() {
    for (var i = 0, n = this._items.length; i < n; i++) {
      this._items[i].destroy()
      delete this._items[i]
    }
    delete this._items
  }

  /**
   * @returns {Model}  the model class itself
   */
  static getModel() {
    return Model;
  };

  /**
   * @public 
   * @instance
   * 
   * @param {number} index the item index to retrieve 
   * 
   * @return {Model}       the Model object
   */
  get(index) {
    return (this._items[index] || null)
  }

  /**
   * @public
   * @instance
   * 
   * @param {Model}     item    A list item to insert
   * @param {number=-1} index   The index at which to insert the list, defaults to the end
   */
  insert(item, index = -1) {
    if (!(item instanceof this.constructor.getModel())) {
      throw new TypeError(`Expect an instance of ${this.constructor.getModel().name} in List.prototype.insert`)
    }

    index === -1

      // insert a item at the end of no number specified
      ? this.push(item)

      // otherwise, insert at specified location
      : this._items.splice(index, 0, item)
  }

  /**
   * @public
   * @instance
   * 
   * @param {Model} item An item to push on to the end of the items
   */
  push(item) {
    if (!(item instanceof this.constructor.getModel())) {
      throw new TypeError(`Expect an instance of ${this.constructor.getModel().name} in push`)
    }

    this._items.push(item)
  }

  /**
   * @param {number} index   index of the item to remove
   */
  delete(index) {
    this._items[index] && this._items.splice(index, 1)
  }

  /**
   * @public
   * @instance
   * 
   * @return {number} the number of items
   */
  count() {
    return this._items.length;
  }

  /**
   * @public
   * @instance
   * 
   * @param {function} cb       A callback that receives each item and index
   * @param {object}   context  The context within which to run the callback
   */
  forEach(cb, context = null) {
    for (let i = 0, n = this._items.length; i < n; i++) {
      context
        ? cb(this._items[i], i, this._items)
        : cb.call(context, this._items[i], i, this._items)
    }
  }
}

export default List