import extendModel from './extendModel.js'

/**
 * Default values for a new sign object
 * 
 * @static
 * @constant
 */
const defaults = {
  url: '',
  filename: '',
  width: 0,
  height: 0,
  dpi: 0,
  type: 0,
  start: 0,
  end: 0,
  is_master: 0,
  suffix: '',
  editionSide: 0,
  artefacts: [],
}

/**
 * Manage all the data related to a sign
 * 
 * Signs are immutable, and any mutations create new signs
 * 
 * @class
 * @extends Record
 */
export default class Image extends extendModel(defaults) {

  /**
   * @return {string} the address of the image file
   */
  getAddress() {
    return `${this.url}${this.filename}/`
  }
}