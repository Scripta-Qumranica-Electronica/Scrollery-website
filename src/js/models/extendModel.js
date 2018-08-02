import Record from './Record'

const baseDefaults = {
  id: 0
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
   * @extends Record
   */
  class BaseModel extends Record({ ...baseDefaults, ...defaultValues }) {
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
