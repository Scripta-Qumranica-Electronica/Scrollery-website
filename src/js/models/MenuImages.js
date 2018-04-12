import MenuObject from './MenuObject.js'
import ImageReference from './ImageReference.js'

/**
 * 
 * A menu image is comprised of a catalog references to actual images.
 * 
 * @class
 */ 
class MenuImages extends MenuObject {

  /**
   * @param {object}          attributes the image attributes
   * @param {array.<MenuImage>=[]} [images]    an array of images
   */
  constructor(sessionID, user, set, itemIDKey, ajaxPayload) {
    itemIDKey = itemIDKey || 'id'
    ajaxPayload = ajaxPayload || {transaction: 'getImgOfComb', user: user,}

    super(sessionID, user, set, itemIDKey, ajaxPayload, ImageReference)
  }

  _newItem(item, index = -1) {
    let entry = new ImageReference(
      this.set,
      this.sessionID,
      item.institution, 
      item.lvl1, 
      item.lvl2, 
      item.side
    )
    entry.populateItems(item[this.itemIDKey])
    this._setItem(item[this.itemIDKey], entry)
    this._insertItem(item[this.itemIDKey], index)
  }
}

export default MenuImages