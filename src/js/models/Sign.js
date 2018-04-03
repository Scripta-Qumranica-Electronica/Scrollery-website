import { Record } from 'immutable'


/**
 * Default values for a new sign object
 * 
 * @static
 * @constant
 */
const defaults = {
  sign_id: 0,
  id: 0,
  sign: '',

  // characteristics
  readability: '',
  break_type: '',
  is_reconstructed: 0,
  is_variant: 0,
  is_retraced: 0,
  is_whitespace: 0,

  // position in stream info

  // > peers
  prev_sign_id: 0,
  next_sign_id: 0,

  // > col
  col_name: '',
  col_id: 0,

  // > line
  line_name: '',
  line_id: 0
}

/**
 * Manage all the data related to a sign
 * 
 * Signs are immutable, and any mutations create new signs
 * 
 * @class
 * @extends Record
 */
export default class Sign extends Record(defaults) {

  constructor(attrs) {
    attrs.id = attrs.sign_id
    attrs.is_whitespace = (!attrs.sign || attrs.sign === '' || attrs.sign === ' ' || attrs.sign === '&nbsp;')
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

    return new Sign(attrs)
  }

  /**
   * @return {boolean} whether or not this sign is preceded by another sign
   */
  hasPrevious() {
    return Boolean(this.prev_sign_id);
  }

  /**
   * @return {boolean} whether or not this sign is followed by another sign
   */
  hasNext() {
    return Boolean(this.next_sign_id)
  }

  /**
   * @returns {boolean} whether or not this sign is reconstructed
   */
  reconstructed() {
    return this.is_reconstructed
  }

  /**
   * @returns {string} 
   */
  toString() {
    return this.is_whitespace ? ' ' : this.sign
  }

  /**
   * @returns {string} 
   */
  toDOMString() {
    return this.is_whitespace ? '&nbsp;' : this.sign
  }
}