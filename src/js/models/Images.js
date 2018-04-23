import MapList from './MapList.js'
import Image from './Image.js'

export default class Images extends MapList {

  constructor(
    username,
    password,
    idKey,
    ajaxPayload = undefined,
    attributes = {})
  {
    idKey = idKey || 'sqe_image_id'
    ajaxPayload = ajaxPayload ? ajaxPayload : {transaction: 'imagesOfInstFragments'}
    super(username, password, idKey, ajaxPayload, Image, attributes)
  }

  static getModel() {
    return Image
  }
}