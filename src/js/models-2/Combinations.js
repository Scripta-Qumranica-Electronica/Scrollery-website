import ItemList from './ItemList.js'
import Combination from './Combination.js'

export default class Combinations extends ItemList {
  constructor(corpus, idKey, defaultPostData = undefined) {
    idKey = idKey || 'scroll_version_id'
    const listType = 'combinations'
    let connectedLists = []
    let relativeToScrollVersion = false
    defaultPostData = defaultPostData
      ? defaultPostData
      : { transaction: 'getCombs', user: corpus.user }
    super(
      corpus,
      idKey,
      Combination,
      listType,
      connectedLists,
      relativeToScrollVersion,
      defaultPostData
    )
  }
}
