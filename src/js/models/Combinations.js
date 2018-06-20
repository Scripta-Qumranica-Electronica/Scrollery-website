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

  cloneScroll(scroll_version_id) {
    const payload = {
      scroll_version_id: scroll_version_id,
      transaction: 'copyCombination',
    }
    this.axios
      .post('resources/cgi-bin/scrollery-cgi.pl', payload)
      .then(res => {
        if (res.status === 200 && res.data && res.data.scroll_data) {
          // We can store hashes for the returned data
          // in the future, so we can avoid unnecessary
          // data transmission.
          // this._hash = res.data.hash

          const scroll_data = res.data.scroll_data
          this._insertItem(new this.recordModel(scroll_data), undefined, 0)
        }
      })
      .catch(error => {
        console.log(error)
      })
  }
}
