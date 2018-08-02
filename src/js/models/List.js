import EventEmitter from './EventEmitter'
import extendModel from './extendModel.js'
import uuid from 'uuid/v1'
import namespacedUuid from 'uuid/v3'

const Model = extendModel()

/**
 * A base class for lists of models. Mainly, this provides an interface to
 * work with an ordered array of child-items.
 *
 * It has a similar API as the array, but is more focused
 *
 * @extends EventEmitter
 */
class List extends EventEmitter {
  /**
   * @param {object={}} [attributes] List attributes
   * @param {array=[]}  [items]      An initial array of items for the list
   */
  constructor(attributes = {}, items = [], isPersisted = false) {
    // event emitter behavior
    super()

    // todo: safety to ensure props not overwritten
    Object.assign(
      this,
      {
        id: Date.now(),
        name: '',

        // create a list-namespaced uid for the model
        __uuid: namespacedUuid(`${attributes.id || Date.now()}`, List.namespace()),
        __persisted: isPersisted
      },
      attributes
    )

    this._items = []
    this.__changes = {
      additions: {},
      deletions: {}
    }

    this.on(['insert', 'push', 'splice'], ({ item, index }) => {
      if (item.isPersisted()) {
        return
      }

      item.on('change', this._itemChanged.bind(this, item))

      if (item instanceof List) {
        item.on('delete', () => this.emit('delete'))
        item.on('addition', () => this.emit('addition'))
      }

      this.emit('addition', { item, index })
      this.emit('change', {
        type: 'addition',
        item,
        index
      })
    })

    // insert each item in turn
    items.forEach(item => this.insert(item))

    // add a length property that forwards to the `count` method
    Object.defineProperty(this, 'length', {
      get: () => this.count(),
      writeable: false
    })
  }

  /**
   * @protected
   * @instance
   *
   * @param {Model}  item
   * @param {object} args
   */
  _itemChanged(item) {
    this.emit('change', {
      item
    })
  }

  /**
   * @public
   * @instance
   *
   * @return {object} The changes object with additions/deletions sub-map
   */
  getChanges() {
    return {
      updates: this._items.reduce((acc, item) => {
        if (item.hasChanges()) {
          acc[item.getUUID()] = item
        }
        return acc
      }, {}),
      ...this.__changes
    }
  }

  /**
   * Once a list has been persisted, this method receives an
   * object with all of the updates.
   *
   * @param {*} persistedMap
   */
  persisted(persistedMap = {}) {
    // remove each deleted item from the change set
    for (const key in persistedMap.deletions) {
      delete this.__changes.deletions[key]
    }

    // for each addition, if there's a corresponding property in the
    // additions map, call persisted on it and remove it from the
    // cahnge object
    for (const key in persistedMap.additions) {
      if (this.__changes.additions[key]) {
        this.__changes.additions[key].persisted(persistedMap.additions[key])
      }
      delete this.__changes.additions[key]
    }

    // TODO: updates
    this.forEach(item => {
      item.persisted(persistedMap)
    })
  }

  /**
   * Destroy and clean up memory
   *
   * @public
   * @instance
   */
  destroy() {
    for (let i = 0, n = this._items.length; i < n; i++) {
      this._items[i].destroy()
      delete this._items[i]
    }
    delete this._items
  }

  /**
   * @static
   * @instance
   *
   * @returns {Record}  the record class itself
   */
  static getModel() {
    return Model
  }

  /**
   * @static
   * @instance
   *
   * @returns {string}  the list class's UUID
   */
  static namespace() {
    return this.uuid || (this.uuid = uuid())
  }

  /**
   * @public
   * @instance
   *
   * @return {string} the list id
   */
  getID() {
    return this.id
  }

  /**
   * @public
   * @instance
   *
   * @return {string} the list instances uuid
   */
  getUUID() {
    return this.__uuid
  }

  /**
   * @public
   * @instance
   *
   * @param {number} index the item index to retrieve
   *
   * @return {Model}       the Model object
   */
  get(index) {
    return this._items[index] || null
  }

  /**
   * @public
   * @instance
   *
   * @return {boolean}       proxies to hasChanges
   */
  isPersisted() {
    return this.hasChanges()
  }

  /**
   * The List has changes if it has any unpersisted sub-items with changes
   * or itself has additions/deletions
   *
   * @public
   * @instance
   *
   * @return {boolean} whether or not the list (including sub-items) has changes
   */
  hasChanges() {
    // initial value is set to if the list itself has changes
    let hasChanges =
      Object.keys(this.__changes.additions).length > 0 ||
      Object.keys(this.__changes.deletions).length > 0

    // the List doesn't have either additions or deletions. Check the sub-items.
    if (!hasChanges) {
      for (let i = 0, item; (item = this._items[i]); i++) {
        if (item.hasChanges()) {
          hasChanges = true
          break
        }
      }
    }

    // finish
    return hasChanges
  }

  /**
   * @public
   * @instance
   *
   * @param {Model}     item    A list item to insert
   * @param {number=-1} index   The index at which to insert the list, defaults to the end
   *
   * @return {number}   the inserted items index
   */
  insert(item, index = -1) {
    const newIndex =
      index === -1
        ? this.push(item) // insert a item at the end of no number specified
        : this.splice(index, item) // otherwise, insert at specified location

    this.emit('insert', {
      index: newIndex,
      item
    })

    return newIndex
  }

  /**
   * @public
   * @instance
   *
   * @param {Model} item An item to push on to the end of the items
   * @return {number}    the inserted model's index
   */
  push(item) {
    if (!(item instanceof this.constructor.getModel())) {
      throw new TypeError(`Expect an instance of ${this.constructor.getModel().name} in push`)
    }

    if (!item.isPersisted()) {
      this.__changes.additions[item.getUUID()] = item
    }

    this._items.push(item)

    // calculate the new index for any listeners
    // and for return value
    const newIndex = this._items.length
    this.emit('push', {
      index: newIndex,
      item
    })

    return newIndex
  }

  /**
   * @public
   * @instance
   *
   * @param {number} index the index to splice into
   * @param {Model}  item  An item to insert in the items
   *
   * @return {number} the inserted models index
   */
  splice(index, item) {
    if (!(item instanceof this.constructor.getModel())) {
      throw new TypeError(
        `Expect an instance of ${this.constructor.getModel().name} in List.prototype.splice`
      )
    }

    if (item.hasChanges()) {
      this.__changes.additions[item.getUUID()] = item
    }

    // insert and emit
    this._items.splice(index, 0, item)
    this.emit('splice', { index, item })

    return index
  }

  /**
   * @param {number} index   index of the item to remove
   */
  delete(index) {
    const deleted = this._items[index] ? this._items.splice(index, 1)[0] : null
    if (deleted) {
      // something can't be added and deleted all at once
      // so remove it from the additions
      if (this.__changes.additions[deleted.getUUID()]) {
        delete this.__changes.additions[deleted.getUUID()]
      } else {
        this.__changes.deletions[deleted.getUUID()] = deleted
      }

      this.emit('delete', { index, deleted })
    }
  }

  /**
   * Removes a range of items and returns them as a new List
   *
   * @public
   * @instance
   *
   * @param {number} start    the start index
   * @param {number} count    the number of items to slice off
   * @param {List}   [target] the target list
   *
   * @returns {List} A new list with the slice which is either the list or one created on the fly
   */
  sliceInto(start, count, target) {
    const slice = this._items.splice(start, count)

    // use or create the new List, and insert the slice into it
    target = target || new this.constructor()
    slice.forEach(item => target.insert(item))

    return target
  }

  /**
   * @public
   * @instance
   *
   * @return {number} the number of items
   */
  count() {
    return this._items.length
  }

  /**
   * @public
   * @instance
   *
   * @param {function} cb       A callback that receives each item and index
   * @param {object}   context  The context within which to run the callback
   */
  forEach(cb, context = null) {
    cb = context ? cb.bind(context) : cb
    for (let i = 0, n = this._items.length; i < n; i++) {
      cb(this._items[i], i, this._items)
    }
  }

  /**
   * Forward on to Array.prototype.find
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
   * @public
   * @instance
   *
   * @param {Record|id|uuid|function} criteria  Criteria by which to find an item
   */
  findIndex(criteria) {
    if (typeof criteria === 'function') {
      return this._items.findIndex(criteria)
    } else {
      return this._items.findIndex(item => {
        return criteria instanceof this.constructor.getModel()
          ? item === criteria // this is an instance of model
          : typeof criteria === 'string' // it's a UUID
            ? item.getUUID() === criteria
            : item.getID() === criteria // criteria is a number, which is assumed to be the id
      })
    }
  }

  /**
   * Expose the list items as a plain array
   *
   * @returns {array} the items
   */
  items() {
    return this._items
  }

  /**
   * Expose the list items as a plain array
   *
   * @returns {array} the items
   */
  toArray() {
    return this._items
  }
}

export default List
