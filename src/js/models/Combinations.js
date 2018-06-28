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
      : { transaction: 'getCombs', user_id: corpus.user }
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

  /* istanbul ignore next */
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

  /* istanbul ignore next */
  removeItem(key, scroll_version_id = undefined) {
    return new Promise((resolve, reject) => {
      const postData = {
        transaction: 'removeCombination',
        scroll_version_id: key,
      }
      try {
        this.axios.post('resources/cgi-bin/scrollery-cgi.pl', postData).then(res => {
          if (res.data && res.data[key] === 'deleted') {
            // Delete all linked cols from corpus model.
            for (let i = 0, col; (col = this.get(key).cols[i]); i++) {
              this.corpus.cols._removeItem(col)
            }
            // Delete all linked artefacts from corpus model.
            for (let i = 0, artefact; (artefact = this.get(key).artefacts[i]); i++) {
              this.corpus.artefacts._removeItem(artefact)
            }
            // Delete all linked image references from corpus model.
            for (
              let i = 0, imageReference;
              (imageReference = this.get(key).imageReferences[i]);
              i++
            ) {
              // Delete all linked images from corpus model.
              for (
                let j = 0, image;
                (image = this.corpus.imageReferences.get(imageReference).images[j]);
                j++
              ) {
                this.corpus.images._removeItem(image)
              }
              this.corpus.imageReferences._removeItem(imageReference)
            }
            // Delete all linked ROI's from corpus model
            for (let i = 0, roi; (roi = this.get(key).rois[i]); i++) {
              this.corpus.rois._removeItem(roi)
            }
            super.removeItem(key, scroll_version_id)
          } else {
            reject(res)
          }
        })
      } catch (err) {
        reject(err)
      }
    })
  }
}
