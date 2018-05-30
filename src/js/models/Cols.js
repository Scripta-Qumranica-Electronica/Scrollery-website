import MapList from './MapList.js'
import Col from './Col.js'

export default class Cols extends MapList {
  constructor(
    session_id,
    idKey,
    ajaxPayload = undefined,
    attributes = {},
    standardTransaction = undefined
  ) {
    idKey = idKey || 'col_id'
    standardTransaction = 'getColOfComb'
    // ajaxPayload = ajaxPayload ? ajaxPayload : {transaction: 'getColOfComb'}
    super(session_id, idKey, ajaxPayload, Col, attributes, standardTransaction)
  }
}
