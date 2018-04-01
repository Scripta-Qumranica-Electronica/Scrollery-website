import MenuObject from './MenuObject.js'

/**
 * A combination is complete material object.
 * 
 * A combination is comprised of a number of images and columns.
 * 
 * @class
 */
class MenuCorpus extends MenuObject {

  /**
   * @param {object}          attributes the image attributes
   * @param {array.<MenuImage>=[]} [images]    an array of images
   */
  constructor($post, id, set, itemIDKey, ajaxPayload, items = {}, itemList = []) {
    ajaxPayload = ajaxPayload || {transaction: 'getCombs', user: id}
    itemIDKey = itemIDKey || 'version_id'
    super($post, id, set, itemIDKey, ajaxPayload, items, itemList)
  }
}

export default MenuCorpus