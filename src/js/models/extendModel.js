import Record from './Record'
import uuid from 'uuid/v1'
import namespacedUuid from 'uuid/v3'

const baseDefaults = {
  id: 0,
  __persisted: false,
  __uuid: '',
}

/**
 *
 * @param {object} defaultValues  Default values for a class that extends
 *
 * @return {BaseModel}
 */
const makeModel = (defaultValues = {}) => {
  /**
   * @class
   * @extends Immutabe.Record
   */
  class BaseModel extends Record({ ...baseDefaults, ...defaultValues }) {
    constructor(x = {}) {
      // add the UUID if not already present in the props
      if (!x.__uuid) {
        x.__uuid = namespacedUuid(`${x.id || Date.now()}`, BaseModel.namespace())
      }

      super(x)
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
     * @returns {boolean}  whether or not the record has unpersisted changes
     */
    hasChanges() {
      return !this.__persisted
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
     * @returns {number} the record ID
     */
    getID() {
      return this.id
    }
  }

  return BaseModel
}

export default makeModel
