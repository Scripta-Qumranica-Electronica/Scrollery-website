import { cloneDeep } from 'lodash'

/**
 * A factory for creating record classes
 *
 * @param {object} [defaults] Default values for when creating a record
 *
 * @return {BaseRecord}       A unique base record class with the defaults accessible
 */
function Record(defaults = {}) {
  function mergeDefaults(props) {
    return {
      ...cloneDeep(defaults),
      ...props,
    }
  }

  /**
   * Return the class
   */
  return class BaseRecord {
    /**
     *
     * @param {object} props  Initial property values
     */
    constructor(props = {}) {
      props = mergeDefaults(props)

      for (let i = 0, keys = Object.keys(props), key; (key = keys[i]); i++) {
        this[key] = props[key]
      }
    }

    /**
     * Reverts a property to its default value
     *
     * @public
     * @instance
     *
     * @param {string} propName  The property name to revert to default state
     */
    clear(propName) {
      this[propName] = cloneDeep(defaults[propName])
    }

    /**
     * @public
     * @instance
     *
     * @param {string} propName  The property name to see if it exists
     */
    has(propName) {
      return {}.hasOwnProperty.call(this, propName)
    }

    /**
     * @public
     * @instance
     *
     * @param {string} propName  The property name to get
     */
    get(propName) {
      return this[propName]
    }

    /**
     * @public
     * @instance
     *
     * @param  {object}    attrs A set of attributes to apply to the copy
     */
    extend(attrs = {}) {
      Object.assign(this, attrs)
      return this
    }

    /**
     * Return a shallow copy of this object
     */
    toJS() {
      return {
        ...this,
      }
    }
  }
}

export default Record
