const property = value => ({
  writable: false,
  configurable: false,
  enumerable: true,
  value
})
  
/**
 * Manage all the data related to an artefact menu item
 * 
 * MenuArtefacts are immutable, and any mutations create new MenuArtefacts
 * 
 * @class
 */
export default class MenuArtefact {

  /**
   * @param {object} attrs artefact menu item attributes
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
   * @return {MenuArtefact}        The sign with the new attributes applied
   */
  extend(attrs = {}) {
    attrs = {
      ...this, // only enumerable, own properties
      ...attrs
    }

    return new MenuArtefact(attrs)
  }
}