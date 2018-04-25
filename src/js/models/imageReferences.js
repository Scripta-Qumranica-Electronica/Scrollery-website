import MapList from './MapList.js'
import ImageReference from './ImageReference.js'

export default class Images extends MapList {

  constructor(
    username,
    password,
    idKey,
    ajaxPayload = undefined,
    attributes = {},
    standardTransaction = undefined)
  {
    idKey = idKey || 'id'
    standardTransaction = 'getImgOfComb'
    // ajaxPayload = ajaxPayload ? ajaxPayload : {transaction: 'getImgOfComb'}
    super(username, password, idKey, ajaxPayload, ImageReference, attributes, standardTransaction)
  }

  static getModel() {
    return ImageReference
  }
}