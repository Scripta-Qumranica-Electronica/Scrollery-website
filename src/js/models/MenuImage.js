import List from './List.js'
import MenuArtefact from './MenuArtefact.js'

/**
 * A MenuImage is a component of a combination
 * 
 * A MenuImage contains one or more MenuArtefacts
 * 
 * @class
 */
class MenuImage extends List {

  /**
   * @param {object}        attributes  The menu image attributes
   * @param {array.<MenuArtefact>=[]} signs       An array of signs that comprise the line
   */
  constructor(attributes, artefacts = []) {
    super(attributes, artefacts)
  }

  static getModel() {
    return MenuArtefact;
  }

  /**
   * @public
   * @instance
   * 
   * @param {MenuArtefact}      artefact    An artefact to insert
   * @param {number=-1} index   The index at which to insert the artefact, defaults to the end
   */
  insert(artefact, index = -1) {
    if (!(artefact instanceof MenuArtefact)) {
      throw new TypeError('MenuImage.prototype.insert(artefact, index) expect a artefact of type MenuArtefact')
    }

    index === -1
      ? this.push(artefacts)
      : super.insert(this._setAttributes(artefact), index)
  }

  /**
   * @public
   * @instance
   * 
   * @param {MenuArtefact} artefact An artefact to insert
   */
  push(artefact) {
    if (!(artefact instanceof MenuArtefact)) {
      throw new TypeError('MenuImage.prototype.push(artefact) expect a artefact of type MenuArtefact')
    }

    super.push(this._setAttributes(artefact))
  }

  /**
   * @private
   * @instance
   * 
   * @param {MenuArtefact} artefact A artefact to insert
   */
  _setAttributes(artefact) {
    return artefact.extend({
      image_name: this.name,
      image_id: this.id,
      combination_name: this.combination_name,
      combination_id: this.combination_id
    })
  }
}

export default MenuImage