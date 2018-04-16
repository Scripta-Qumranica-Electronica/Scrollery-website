import MapList from './MapList.js'
import Combination from './Combination.js'

class Combinations extends MapList {

  constructor(
    user,
    sessionID,
    idKey,
    ajaxPayload = undefined,
    attributes = {})
  {
    idKey = idKey || 'scroll_version_id'
    ajaxPayload = ajaxPayload ? ajaxPayload : {transaction: 'getCombs', user: user}
    super(sessionID, idKey, ajaxPayload, Combination, attributes)
  }

  static getModel() {
    return Combination
  }
}

export default Combinations