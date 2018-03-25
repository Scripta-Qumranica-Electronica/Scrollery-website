const property = value => ({
  writable: false,
  configurable: false,
  enumerable: true,
  value
})

/**
 * Manage all the data related to a sign
 * 
 * @class
 */
export default class Sign {

  /**
   * 
   * @param {object} attrs sign attributes
   * @param {Map} signMap  reference to the map that contains all linked signs
   */
  constructor(attrs, signMap) {
    this.map = signMap;

    // set the properties as read only to preserve integretity of the data point
    Object.defineProperties(this, {
      id: property(attrs.id),
      sign: property(attrs.sign),
      is_variant: property(attrs.is_variant),
      break_type: property(attrs.break_type),
      is_reconstructed: property(attrs.is_reconstructed),
      readability: property(attrs.readability),
      is_retraced: property(attrs.is_retraced),
      prev_sign_id: property(attrs.prev_sign),
      prev_sign: {
        configurable: false,
        enumerable: true,
        get() {
          signMap.get(this.prev_sign_id)
        },
        set() {
          throw new Error("attempt to write read-only property");
        }
      },
      next_sign_id: property(attrs.next_sign),
      next_sign: {
        configurable: false,
        enumerable: true,
        get() {
          signMap.get(this.next_sign_id)
        },
        set() {
          throw new Error("attempt to write read-only property");
        }
      },
    })

    // don't allow new props
    Object.freeze(this);
  }

  /**
   * @return {boolean} whether or not this sign is preceded by another sign
   */
  hasPrevious() {
    return this.prev_sign_id ? this.map.has(this.prev_sign_id) : false;
  }

  /**
   * @return {Sign} The previous sign object
   */
  previous() {
    return this.hasPrevious()
      ? this.map.get(this.prev_sign_id)
      : null;
  }

  /**
   * @return {boolean} whether or not this sign is followed by another sign
   */
  hasNext() {
    return this.next_sign_id ? this.map.has(this.next_sign_id) : false
  }

  /**
   * @return {Sign} The next sign object
   */
  next() {
    return this.hasNext()
      ? this.map.get(this.next_sign_id)
      : null;
  }

  isWhitespace() {
    return this.sign === '·'
  }

  reconstructed() {
    return this.is_reconstructed
  }
}