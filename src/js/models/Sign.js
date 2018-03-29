const property = value => ({
  writable: false,
  configurable: false,
  enumerable: true,
  value
})

/**
 * Manage all the data related to a sign
 * 
 * Signs are immutable, and any mutations create new signs
 * 
 * @class
 */
export default class Sign {

  /**
   * @param {object} attrs sign attributes
   */
  constructor(attrs) {

    // set the properties as read only to preserve integrity of the data point
    const props = {}
    const keys = Object.keys(attrs)
    for (var i = 0, n = keys.length; i < n; i++) {
      let propName = keys[i]
      props[propName] = property(attrs[propName])
    }

    // set props on the Sign
    Object.defineProperties(this, props)

    // don't allow new props
    Object.freeze(this)
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
      ...this, // only enumerable, own properties
      ...attrs
    }

    return new Sign(attrs)
  }

  /**
   * @return {boolean} whether or not this sign is preceded by another sign
   */
  hasPrevious() {
    return Boolean(this.prev_sign);
  }

  /**
   * @return {boolean} whether or not this sign is followed by another sign
   */
  hasNext() {
    return Boolean(this.next_sign)
  }

  /**
   * @returns {boolean} whether or not this sign is a whitespace character
   */
  isWhitespace() {
    return this.sign === '·'
  }

  /**
   * @returns {boolean} whether or not this sign is reconstructed
   */
  reconstructed() {
    return this.is_reconstructed
  }
}