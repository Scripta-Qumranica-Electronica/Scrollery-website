import extendModel from './extendModel.js'

/**
 * Default values for a new sign object
 * 
 * @static
 * @constant
 */
const defaults = {
  name: '',
  scroll_id: 0,
  scroll_version_id: 0,
  locked: 0,
  user_id: 0,
  cols: [],
  imageReferences: [],
  artefacts: [],
  rois: []
}

/**
 * Manage all the data related to a sign
 * 
 * Signs are immutable, and any mutations create new signs
 * 
 * @class
 * @extends Record
 */
export default class Combination extends extendModel(defaults) { } 