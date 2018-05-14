import extendModel from './extendModel.js'

/**
 * Default values for a new sign object
 *
 * @static
 * @constant
 */
const defaults = {
  sign_char_roi_id: 0,
  sign_char_id: 0,
  path: '',
  transform_matrix: '',
}

/**
 * Manage all the data related to a sign
 *
 * Signs are immutable, and any mutations create new signs
 *
 * @class
 * @extends Record
 */
export default class ROI extends extendModel(defaults) {}
