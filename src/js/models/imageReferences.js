import MapList from './MapList.js'
import ImageReference from './ImageReference.js'

export default class Images extends MapList {
  constructor(
    session_id,
    idKey,
    ajaxPayload = undefined,
    attributes = {},
    standardTransaction = undefined
  ) {
    idKey = idKey || 'id'
    standardTransaction = 'getImgOfComb'
    // ajaxPayload = ajaxPayload ? ajaxPayload : {transaction: 'getImgOfComb'}
    super(session_id, idKey, ajaxPayload, ImageReference, attributes, standardTransaction)
  }
}
