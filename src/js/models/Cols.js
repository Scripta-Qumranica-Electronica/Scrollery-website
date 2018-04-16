import MapList from './MapList.js'
import Col from './Col.js'

export default class Cols extends MapList {

  constructor(
    sessionID,
    idKey,
    ajaxPayload = undefined,
    attributes = {})
  {
    idKey = idKey || 'col_id'
    ajaxPayload = ajaxPayload ? ajaxPayload : {transaction: 'getColOfComb'}
    super(sessionID, idKey, ajaxPayload, Col, attributes)
  }

  static getModel() {
    return Col
  }
}