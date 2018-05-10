import MapList from './MapList.js'
import Combination from './Combination.js'

class Combinations extends MapList {
  constructor(user, session_id, idKey, ajaxPayload = undefined, attributes = {}) {
    idKey = idKey || 'scroll_version_id'
    ajaxPayload = ajaxPayload
      ? ajaxPayload
      : { requests: [{ transaction: 'getCombs', user: user }] }
    super(session_id, idKey, ajaxPayload, Combination, attributes)
  }
}

export default Combinations
