import cloneDeep from 'lodash/cloneDeep'
import uuid from 'uuid/v1'
import namespacedUuid from 'uuid/v3'

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
   * The base record class has the following capabilities:
   *
   * It tracks changes and knows which properties have changed.
   *
   * It keeps track of whether or not it's been persisted. If a property changes
   * it considers them not persisted.
   *
   * When setting a property to null/undefined, the value is set to the default
   * value rather than null/undefined. you can also use Record.prototype.clear(propName)
   * for the same behavior.
   */
  return class BaseRecord {
    /**
     *
     * @param {object}  props        Initial property values
     * @param {boolean} isPersisted
     */
    constructor(props = {}, isPersisted = false) {
      // a closure variable to track the property definitions
      const propDefinitions = {}

      // setup a closure value to track the property values
      const values = {}

      // the record is persisted if it's not new.
      const privates = {
        __persisted: Boolean(isPersisted || props.__persisted),
        __uuid: props.__uuid || namespacedUuid(`${props.id || Date.now()}`, BaseRecord.namespace()),
      }
      Object.defineProperties(this, {
        __persisted: {
          get() {
            return privates.__persisted
          },
          set(persisted) {
            privates.__persisted = Boolean(persisted)
          },
          enumerable: true,
        },
        __uuid: {
          value: privates.__uuid,
          writeable: false,
          enumerable: true,
        },
        changedProperties: {
          enumerable: false,

          /**
           * @public
           * @instance
           *
           * @return {string[]}  an array of property names that have changed
           */
          value: function() {
            var changes = []
            for (let key in values) {
              ;(function(k) {
                if (values[k].original !== values[k].value) {
                  changes.push(k)
                }
              })(key)
            }
            return changes
          },
        },
        persisted: {
          enumerable: false,

          /**
           * After the record is persisted, called "persisted" with
           * any changed/updated properties on the record. This will
           * set all those updated and then toggle off the persisted flag.
           *
           * @public
           * @instance
           *
           * @param {object} propUpdates
           */
          value: function(propUpdates = {}) {
            // safeguard
            delete propUpdates.__uuid

            // write properties onto the record
            for (let prop in propUpdates) {
              this[prop] = propUpdates[prop]
            }

            // reset the original values to the current state now
            // the record has been persisted.
            for (let prop in this) {
              values[prop].original = this[prop]
            }

            // reset persisted
            this.__persisted = true
          },
        },
      })
      delete props.__uuid
      delete props.__persisted

      // merge in the properties with the default values
      // to get a full data set.
      props = mergeDefaults(props)

      // iterate through the properties
      for (let key in props) {
        // setup closures to preserve the key value as k in each
        ;(function(k) {
          // initialize the value to track the value
          values[k] = {
            original: props[k],
            value: props[k],
          }

          // initialize the prop definition
          propDefinitions[k] = {
            get() {
              return values[k].value
            },
            set(value) {
              // disallow null/undefined -- use default instead
              // note that non-strict equality == matches null and undefined
              value = value == null ? props[k] : value

              // ensure type-safety of the property set. It must match the default
              // if (typeof value !== typeof defaults[k]) {
              //   throw new Error(
              //     `Attempting to set property ${key} on the Record with ${value} which is of type ${typeof value}, but expected ${typeof defaults[
              //       k
              //     ]}`
              //   )
              // }

              // only toggle off persisted if it the value doesn't match
              // otherwise, retain the current value of __persisted
              this.__persisted = value !== values[k].value ? false : this.__persisted

              // apply the value
              values[k].value = value
            },
            enumerable: true,
          }
        }.call(this, key))
      }

      // set the properties on the record
      Object.defineProperties(this, propDefinitions)

      // disallow new properties, deleting properties, etc.
      // Object.freeze(this)
    }

    /**
     * @static
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
     * @return {string} the list instances uuid
     */
    getUUID() {
      return this.__uuid
    }

    /**
     * @public
     * @instance
     *
     * @returns {boolean}  whether or not the record has unpersisted changes
     */
    hasChanges() {
      return !this.__persisted
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
