import extendModel from './extendModel.js'

/**
 * Default values for a new sign object
 *
 * @static
 * @constant
 */
const defaults = {
  institution: '',
  lvl1: '',
  lvl2: '',
  side: 0,
  id: 0,
  images: [],
  artefacts: [],
  regionsOfInterest: [],
}

/**
 * Manage all the data related to a sign
 *
 * Signs are immutable, and any mutations create new signs
 *
 * @class
 * @extends Record
 */
export default class ImageReference extends extendModel(defaults) {}
