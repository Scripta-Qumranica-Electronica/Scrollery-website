import ItemListOrdered from './ItemListOrdered.js'
// import Combination from './Combination.js'

export default class Combinations extends ItemListOrdered {
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
      // Combination,
      listType,
      connectedLists,
      relativeToScrollVersion,
      defaultPostData
    )

    // Setup socket.io listeners
    this.socket.on('populateCombinations', msg => {
      console.log('Processing list of combinations')
      this.processPopulate(msg)
    })

    // Emit any initial requests
    this.socket.emit('getAllCombinations', {
      SESSION_ID: this.corpus.session_id,
      user_id: this.corpus.user,
    })
  }

  formatRecord(record) {
    return {
      name: record.name,
      scroll_id: ~~record.scroll_id,
      scroll_version_id: ~~record.scroll_version_id,
      locked: ~~record.locked,
      user_id: ~~record.user_id,
      cols: record.cols || [],
      lines: record.lines || [],
      imageReferences: record.imageReferences || [],
      artefacts: record.artefacts || [],
      rois: record.rois || [],
      initial_sign_id: record.initial_sign_id || undefined,
    }
  }

  /* istanbul ignore next */
  updateName(item_id, name, scroll_version_id) {
    return super.updateName(item_id, name, undefined, 'changeCombinationName')
  }

  /* istanbul ignore next */
  cloneScroll(scroll_version_id) {
    const payload = {
      scroll_version_id: scroll_version_id,
      transaction: 'copyCombination',
    }
    return new Promise((resolve, reject) => {
      this.axios
        .post('resources/cgi-bin/scrollery-cgi.pl', payload)
        .then(res => {
          if (res.status === 200 && res.data && res.data.scroll_data) {
            const scroll_data = res.data.scroll_data.results[0]
            this._insertItem(new this.recordModel(scroll_data), undefined, 0)
            resolve(res)
          }
        })
        .catch(err => {
          console.error(err)
          reject(err)
        })
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
              this.corpus.cols._removeItem(col, key)
            }
            // Delete all linked artefacts from corpus model.
            for (let i = 0, artefact; (artefact = this.get(key).artefacts[i]); i++) {
              this.corpus.artefacts._removeItem(artefact, key)
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
              this.corpus.rois._removeItem(roi, key)
            }
            resolve(super.removeItem(key, scroll_version_id))
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
