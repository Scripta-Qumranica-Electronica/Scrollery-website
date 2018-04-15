import MapList from './MapList.js'
import Image from './Image.js'

export default class Images extends MapList {

  constructor(
    sessionID,
    idKey,
    ajaxPayload = undefined,
    attributes = {})
  {
    idKey = idKey || 'sqe_image_id'
    ajaxPayload = ajaxPayload ? ajaxPayload : {transaction: 'imagesOfInstFragments'}
    super(sessionID, idKey, ajaxPayload, Image, attributes)
  }

  static getModel() {
    return Image
  }
}