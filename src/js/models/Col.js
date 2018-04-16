import { Record } from 'immutable'

/**
 * Default values for a new sign object
 * 
 * @static
 * @constant
 */
const defaults = {
  col_id: 0,
  name: '',
}

/**
 * Manage all the data related to a sign
 * 
 * Signs are immutable, and any mutations create new signs
 * 
 * @class
 * @extends Record
 */
export default class Col extends Record(defaults) {

  constructor(attrs) {
    super(attrs)
  }

  /**
   * @public
   * @instance
   * 
   * @return {string} the sign Id
   */
  getID() {
    return this.id
  }

  /**
   * @public
   * @instance
   * 
   * @param {object} attrs A set of attributes to apply to the copy
   * @return {Sign}        The sign with the new attributes applied
   */
  extend(attrs = {}) {
    attrs = {
      ...this.toJS(), // only enumerable, own properties
      ...attrs
    }

    return new Col(attrs)
  }
}