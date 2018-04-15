import { Record } from 'immutable'

/**
 * Default values for a new sign object
 * 
 * @static
 * @constant
 */
const defaults = {
  url: '',
  filename: '',
  width: 0,
  height: 0,
  dpi: 0,
  type: 0,
  wavelengthStart: 0,
  wavelengthEnd: 0,
  isMaster: 0,
  suffix: '',
  editionSide: 0,
}

/**
 * Manage all the data related to a sign
 * 
 * Signs are immutable, and any mutations create new signs
 * 
 * @class
 * @extends Record
 */
export default class Image extends Record(defaults) {

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

    return new Image(attrs)
  }

  getAddress() {
    return `${this.url}${this.filename}/`
  }
}