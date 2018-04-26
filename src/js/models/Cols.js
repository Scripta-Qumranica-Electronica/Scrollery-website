import MapList from './MapList.js'
import Col from './Col.js'

export default class Cols extends MapList {
  constructor(
    username,
    password,
    idKey,
    ajaxPayload = undefined,
    attributes = {},
    standardTransaction = undefined
  ) {
    idKey = idKey || 'col_id'
    standardTransaction = 'getColOfComb'
    // ajaxPayload = ajaxPayload ? ajaxPayload : {transaction: 'getColOfComb'}
    super(username, password, idKey, ajaxPayload, Col, attributes, standardTransaction)
  }
}
