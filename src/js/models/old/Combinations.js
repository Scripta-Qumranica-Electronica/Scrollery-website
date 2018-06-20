import MapList from './MapList.js'
import Combination from './Combination.js'

class Combinations extends MapList {
  constructor(corpus, idKey, recordModel, defaultPostData = undefined) {
    idKey = idKey || 'scroll_version_id'
    defaultPostData = defaultPostData
      ? defaultPostData
      : { transaction: 'getCombs', user: corpus.user }
    super(corpus, idKey, Combination, defaultPostData)
  }
}

export default Combinations
