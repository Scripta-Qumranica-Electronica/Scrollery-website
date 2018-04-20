import { Record } from 'immutable'

/**
 * Default values for a new sign object
 * 
 * @static
 * @constant
 */
const defaults = {
  name: '',
  scroll_id: 0,
  scroll_version_id: 0,
  locked: 0,
  user_id: 0,
  cols: [],
  imageReferences: [],
  artefacts: [],
  rois: []
}

/**
 * Manage all the data related to a sign
 * 
 * Signs are immutable, and any mutations create new signs
 * 
 * @class
 * @extends Record
 */
export default class Combination extends Record(defaults) {

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

    return new Combination(attrs)
  }
}