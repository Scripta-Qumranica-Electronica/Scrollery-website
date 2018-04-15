import MapList from './MapList.js'
import ImageReference from './ImageReference.js'

export default class Images extends MapList {

  constructor(
    sessionID,
    idKey,
    ajaxPayload = undefined,
    attributes = {})
  {
    idKey = idKey || 'id'
    ajaxPayload = ajaxPayload ? ajaxPayload : {transaction: 'getImgOfComb'}
    super(sessionID, idKey, ajaxPayload, ImageReference, attributes)
  }

  static getModel() {
    return ImageReference
  }
}