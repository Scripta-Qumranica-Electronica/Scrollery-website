import { Record } from 'immutable'

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
  class BaseModel extends Record({id: 0, ...defaultValues}) {

    /**
     * @returns {number} the record ID
     */
    getID() {
      return this.id
    }

    /**
     * @public
     * @instance
     * 
     * @param  {object}    attrs A set of attributes to apply to the copy
     * @return {BaseModel}       The new base model extended with new props
     */
    extend(attrs = {}) {
      attrs = {
        ...this.toJS(), // only enumerable, own properties
        ...attrs
      }

      return new this.constructor(attrs)
    }
  }

  return BaseModel
}

export default makeModel