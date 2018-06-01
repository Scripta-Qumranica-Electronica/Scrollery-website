import extendModel from './extendModel.js'

/**
 * Default values for a new sign object
 *
 * @static
 * @constant
 */
const defaults = {
  artefact_position_id: 0,
  name: '',
  side: 0,
  mask: '',
  svgInCombination: '',
  transform_matrix: '',
  rect: '',
  image_catalog_id: Number,
  rois: [],
}

/**
 * Manage all the data related to a sign
 *
 * Signs are immutable, and any mutations create new signs
 *
 * @class
 * @extends Record
 */
export default class Artefact extends extendModel(defaults) {}
