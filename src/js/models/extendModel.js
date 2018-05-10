import Record from './Record'

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
  class BaseModel extends Record({ id: 0, ...defaultValues }) {
    /**
     * @returns {number} the record ID
     */
    getID() {
      return this.id
    }
  }

  return BaseModel
}

export default makeModel
