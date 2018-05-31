import extendModel from './extendModel.js'
import Char from './Char.js'

/**
 * Default values for a new sign object
 *
 * @static
 * @constant
 */
const defaults = {
  sign_id: 0,
  id: 0,

  chars: [],

  // position in stream info

  // > peers
  next_sign_ids: [],
}

/**
 * Manage all the data related to a sign
 *
 * Signs are immutable, and any mutations create new signs
 *
 * @class
 * @extends Record
 */
export default class Sign extends extendModel(defaults) {
  constructor(attrs, isPersisted) {
    if (!Array.isArray(attrs.next_sign_ids)) {
      attrs.next_sign_ids = [attrs.next_sign_ids]
    }

    if (!Array.isArray(attrs.chars)) {
      attrs.chars = [attrs.chars]
    }
    attrs.chars = attrs.chars.map(char => new Char(char))

    super(attrs, isPersisted)
  }

  /**
   * @return {boolean} whether or not this sign is followed by another sign
   */
  hasNext() {
    return this.next_sign_ids.length > 0
  }

  /**
   * @returns {string}
   */
  toString() {
    return this.chars[0].toString()
  }

  /**
   * @returns {string}
   */
  toDOMString() {
    return this.chars[0].toDOMString()
  }
}
