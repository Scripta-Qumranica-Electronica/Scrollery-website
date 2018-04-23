import MapList from './MapList.js'
import ImageReference from './ImageReference.js'

export default class Images extends MapList {

  constructor(
    username,
    password,
    idKey,
    ajaxPayload = undefined,
    attributes = {})
  {
    idKey = idKey || 'id'
    ajaxPayload = ajaxPayload ? ajaxPayload : {transaction: 'getImgOfComb'}
    super(username, password, idKey, ajaxPayload, ImageReference, attributes)
  }

  static getModel() {
    return ImageReference
  }
}