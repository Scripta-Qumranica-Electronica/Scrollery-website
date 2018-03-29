const property = value => ({
  writable: false,
  configurable: false,
  enumerable: true,
  value
})

/**
 * The base model class
 */
class Model {
  constructor(attrs = {}) {
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
}

export default Model