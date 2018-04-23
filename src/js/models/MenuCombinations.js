import MenuObject from './MenuObject.js'

/**
 * A combination is complete material object.
 *
 * A combination is comprised of a number of images and columns.
 *
 * @class
 */
class MenuCombinations extends MenuObject {
  /**
   * @param {object}          attributes the image attributes
   * @param {array.<MenuImage>=[]} [images]    an array of images
   */
  constructor(sessionID, user, set, username, password, itemIDKey, ajaxPayload) {
    itemIDKey = itemIDKey || 'version_id'
    ajaxPayload = ajaxPayload || { transaction: 'getCombs', user: user }
    super(sessionID, user, set, username, password, itemIDKey, ajaxPayload)
  }
}

export default MenuCombinations
