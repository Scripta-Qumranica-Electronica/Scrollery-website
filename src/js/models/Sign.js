import extendModel from './extendModel.js'
import Char from './Char.js'
import CharList from './CharList.js'

/**
 * Default values for a new sign object
 *
 * @static
 * @constant
 */
const defaults = {
  sign_id: 0,
  id: 0,

  chars: new CharList(),

  // position in stream info

  // > peers
  next_sign_ids: []
}

/**
 * Manage all the data related to a sign
 *
 * Signs are immutable, and any mutations create new signs
 *
 * @class
 * @extends Record
 */
export default class Sign extends extendModel(defaults, { propogate: false }) {
  constructor(attrs, isPersisted) {
    // When sign streams split, next_sign_ids is an array of all next signs
    // For consistency, we make this a single one
    attrs.next_sign_ids = attrs.next_sign_ids || []
    if (!Array.isArray(attrs.next_sign_ids)) {
      attrs.next_sign_ids = [attrs.next_sign_ids]
    }

    // A sign can have multiple characters. If there isn't an array,
    // coerace it to an array.
    attrs.chars = attrs.chars || []
    if (!Array.isArray(attrs.chars)) {
      attrs.chars = [attrs.chars]
    }
    attrs.chars = new CharList(
      {},
      attrs.chars.map(char => new Char(char, isPersisted)) || [],
      isPersisted
    )

    super(attrs, isPersisted)
  }

  /**
   * @return {number} the sign id
   */
  getID() {
    return this.sign_id
  }

  /**
   * @return {boolean} whether or not this sign is followed by another sign
   */
  hasNext() {
    return this.next_sign_ids.length > 0
  }

  /**
   * @return {AttributeList} the attribute list
   */
  attributes() {
    return this.getMainChar().attributes
  }

  /**
   * @public
   * @instance
   *
   * @param {object} attribute  object representation of the attribute to add to the sign
   */
  addAttribute(attribute) {
    return this.getMainChar().addAttribute(attribute)
  }

  /**
   * @public
   * @instance
   *
   * @param {object} attribute  object representation of the attribute to add to the sign
   */
  removeAttribute(attributeId) {
    this.getMainChar().removeAttribute(attributeId)
  }

  /**
   * For now, simply return the first char, but plan for needing to return the main
   * char when there are multiple. It will likely be indicated by a flag on the char itself
   *
   * @public
   * @return {Char} the char object
   */
  getMainChar() {
    return this.chars.get(0)
  }

  /**
   * @public
   * @instance
   *
   * @return {boolean} whether or not the sign is a whitespace
   */
  isWhitespace() {
    return this.getMainChar().is_whitespace
  }

  /**
   * @public
   * @instance
   *
   * @returns {string}
   */
  toString() {
    return this.getMainChar().toString()
  }

  /**
   * @public
   * @instance
   *
   * @returns {string}
   */
  toDOMString() {
    return this.getMainChar().toDOMString()
  }
}
