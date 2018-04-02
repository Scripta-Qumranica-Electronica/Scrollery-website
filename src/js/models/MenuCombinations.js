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
  constructor(post, user, set, itemIDKey, ajaxPayload) {
    itemIDKey = itemIDKey || 'version_id'
    ajaxPayload = ajaxPayload || {transaction: 'getCombs', user: user}
    super(post, user, set, itemIDKey, ajaxPayload)
  }
}

export default MenuCombinations