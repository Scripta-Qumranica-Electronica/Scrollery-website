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
  sign_char_id: 0,
  sign_char: '',

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
export default class Char extends extendModel(defaults) {
  constructor(attrs, isPersisted) {
    if (!Array.isArray(attrs.attributes)) {
      attrs.attributes = attrs.attributes ? [attrs.attributes] : []
    }

    // coerce attributes to the a List
    if (attrs.attributes && !(attrs.attributes instanceof AttributeList)) {
      attrs.attributes = new AttributeList(
        {},
        attrs.attributes.map(a => new Attribute(a, isPersisted)),
        isPersisted
      )
    }

    attrs.id = attrs.sign_char_id
    attrs.is_whitespace =
      !attrs.sign_char ||
      attrs.sign_char === '' ||
      attrs.sign_char === ' ' ||
      attrs.sign_char === '&nbsp;' ||
      attrs.sign_char === '·'

    super(attrs, isPersisted)
  }

  /**
   * Add an attribute to the AttributeList
   *
   * @param {Attribute|object} attribute  The attribute to add
   */
  addAttribute(attribute) {
    attribute = attribute instanceof Attribute ? attribute : new Attribute(attribute)

    if (!attribute.attribute_name) {
      throw new Error('attributes must have names')
    }

    // ensure there's no duplicates
    if (!this.attributes.find(attr => attr.attribute_name == attribute.attribute_name)) {
      this.attributes.push(attribute)
    }

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
    const i = this.attributes.findIndex(attributeID)
    return i >= 0 ? this.attributes.delete(i) : null
  }

  /**
   * @todo
   *
   * @returns {string}
   */
  toString() {
    return this.is_whitespace ? ' ' : this.sign_char
  }

  /**
   * @todo
   *
   * @returns {string}
   */
  toDOMString() {
    return this.is_whitespace ? '&nbsp;' : this.sign_char
  }
}
