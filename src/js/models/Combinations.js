import MapList from './MapList.js'
import Combination from './Combination.js'

class Combinations extends MapList {

  constructor(
    user,
    username, 
    password,
    idKey,
    ajaxPayload = undefined,
    attributes = {})
  {
    idKey = idKey || 'scroll_version_id'
    ajaxPayload = ajaxPayload ? ajaxPayload : {requests: [{transaction: 'getCombs', user: user}]}
    super(username, password, idKey, ajaxPayload, Combination, attributes)
  }

  static getModel() {
    return Combination
  }
}

export default Combinations