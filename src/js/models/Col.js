import extendModel from './extendModel.js'

/**
 * Default values for a new sign object
 * 
 * @static
 * @constant
 */
const defaults = {
  col_id: 0,
  name: '',
}

/**
 * Manage all the data related to a sign
 * 
 * Signs are immutable, and any mutations create new signs
 * 
 * @class
 * @extends Record
 */
export default class Col extends extendModel(defaults) { }