import extendModel from './extendModel.js'
import Attribute from './Attribute.js'
import AttributeList from './AttributeList.js'

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
  line_id: 0,

  // > attributes
  attributes: new AttributeList(),
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
    attrs.id = attrs.sign_id
    attrs.is_whitespace =
      !attrs.sign ||
      attrs.sign === '' ||
      attrs.sign === ' ' ||
      attrs.sign === '&nbsp;' ||
      attrs.sign === '·'

    // coerce attributes to the a List
    if (attrs.attributes && !(attrs.attributes instanceof AttributeList)) {
      attrs.attributes = new AttributeList(
        {
          sign_id: attrs.sign_id,
        },
        attrs.attributes
      )
    }

    super(attrs, isPersisted)
  }

  /**
   * Add an attribute to the AttributeList
   *
   * @param {Attribute|object} attribute  The attribute to add
   */
  addAttribute(attribute) {
    this.attributes.push(attribute instanceof Attribute ? attribute : new Attribute(attribute))
    return this.attributes.items()
  }

  /**
   * Remove an attribute from the Sign
   *
   * @param {string} attributeID  The attribute ID to remove from the AttributeList
   */
  removeAttribute(attributeID) {
    // safeguard
    if (attributeID == null) {
      return
    }

    // determine the index of the item to remove
    let i = this.attributes.findIndex(attributeID)
    return i >= 0 ? this.attributes.delete(i) : null
  }

  /**
   * @return {boolean} whether or not this sign is preceded by another sign
   */
  hasPrevious() {
    return Boolean(this.prev_sign_id)
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
