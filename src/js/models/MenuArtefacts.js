import MenuObject from './MenuObject.js'

/**
 * A combination is complete material object.
 * 
 * A combination is comprised of a number of images and columns.
 * 
 * @class
 */
class MenuArtefacts extends MenuObject {

  /**
   * @param {object}          attributes the image attributes
   * @param {array.<MenuImage>=[]} [images]    an array of images
   */
  constructor(sessionID, user, set, itemIDKey, ajaxPayload) {
    itemIDKey = itemIDKey || 'artefact_id'
    ajaxPayload = ajaxPayload || {transaction: 'getArtOfImage',}
      
    super(sessionID, user, set, itemIDKey, ajaxPayload)
  }
}

export default MenuArtefacts