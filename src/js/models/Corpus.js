import Combinations from './Combinations.js'
import ImageReferences from './imageReferences.js'
import Cols from './Cols.js'
import Images from './Images.js'
import Artefacts from './Artefacts.js'
import axios from 'axios'

/* TODO I ignore this for testing until I decide on
 * a set model.  Write tests when that has been
 * determined!
 */

/* istanbul ignore next */

/**
 * A corpus is collection of all consituent objects.
 * 
 * A corpus is comprised of a number of combinations, columns, images, and artefacts.
 * 
 * @class
 */
export default class Corpus {

  /**
   * @param {post}          an instance of Axios $post.
   * @param {user} Number   the user id for the model
   * @param {set}           the set function which the framework uses for reactivity
   */
  constructor(user, username, password) {
    this._user = user
    this.username = username
    this.password = password

    this.combinations = new Combinations(
      this._user,
      this.username,
      this.password
    )
    this.imageReferences = new ImageReferences(
      this.username,
      this.password
    )
    this.cols = new Cols(
      this.username,
      this.password
    )
    this.images = new Images(
      this.username,
      this.password
    )
    this.artefacts = new Artefacts(
      this.username,
      this.password
    )
  }

  populateCombinations() {
    return new Promise((resolve, reject) => {
      this.combinations.populate()
      .then(resolve)
      .catch(reject)
    }) 
  }

  populateColumnsOfCombination(scrollID, scrollVersionID) {
    if (scrollVersionID.constructor !== Array) scrollVersionID = [scrollVersionID]
    if (scrollID.constructor !== Array) scrollID = [scrollID]
    return new Promise((resolve, reject) => {
      let payload = {requests: []}
      if(scrollID.length === scrollVersionID.length) {
        scrollVersionID.forEach((id, index) => {
          payload.requests.push({combID: scrollID[index], scroll_version_id: id, transaction: this.cols.standardTransaction})
        })
        this.cols.populate(payload)
        .then(res => {
          res.forEach((reply, index) => {
            const currentScrollVersionID = scrollVersionID[index] >>> 0 
            let cols = []
            reply.results.forEach(item => {
              if (item[this.cols.idKey]) cols.push(item[this.cols.idKey])
            })
            let combinationRecord = this.combinations.get(currentScrollVersionID).toJS()
            combinationRecord.cols = cols
            this.combinations.set(currentScrollVersionID, new this.combinations.model(combinationRecord))
          })
          resolve(res)
        })
        .catch(reject)
      } else reject(new Error('The scrollID and scrollVersion inputs were of different lengths.'))
    })
  }

  populateImageReferencesOfCombination(scrollVersionID) {
    if (scrollVersionID.constructor !== Array) scrollVersionID = [scrollVersionID]
    let payload = {requests: []}
    scrollVersionID.forEach(id => {
      payload.requests.push({combID: id, scrollVersionID: id, transaction: this.imageReferences.standardTransaction})
    })
    return new Promise((resolve, reject) => {
      this.imageReferences.populate(payload)
      .then(res => {
        res.forEach((reply, index) => {
          const currentScrollVersionID = scrollVersionID[index] >>> 0 
          let imageRefs = []
          reply.results.forEach(imageReference => {
            if (imageReference.id) imageRefs.push(imageReference.id)
          })
          let combinationRecord = this.combinations.get(currentScrollVersionID).toJS()
          combinationRecord.imageReferences = imageRefs
          this.combinations.set(currentScrollVersionID, new this.combinations.model(combinationRecord))
        })
        resolve(res)
      })
      .catch(reject)
    }) 
  }

  // populateImagesOfCombination(imageReferenceID, scrollVersionID) {
  //   return new Promise((resolve, reject) => {
  //     this.images.populate({id: imageReferenceID}, scrollVersionID)
  //     .then(res => {
  //       resolve(res)
  //     })
  //   }) 
  // }

  populateImagesOfImageReference(imageReferenceID, scrollVersionID) {
    if (imageReferenceID.constructor !== Array) imageReferenceID = [imageReferenceID]
    // If scrollVersionID is not an array, convert it into one matching the
    // length of imageReferenceID.
    if (scrollVersionID.constructor !== Array) {
      const tempScrollVersionID = scrollVersionID
      scrollVersionID = []
      imageReferenceID.forEach(ref => {
        scrollVersionID.push(tempScrollVersionID)
      })
    }
    return new Promise((resolve, reject) => {
      if(imageReferenceID.length === scrollVersionID.length) {
        let payload = {requests: []}
        imageReferenceID.forEach((id, index) => {
          payload.requests.push({id: id, scrollVersionID: scrollVersionID[index], transaction: this.images.standardTransaction})
        })
        this.images.populate(payload)
        .then(res => {
          res.forEach((reply, index) => {
            const currentImageReferenceID = imageReferenceID[index] >>> 0
            let images = []
            reply.results.forEach(image => {
              if(image[this.images.idKey]) images.push(image[this.images.idKey])
            })
            let imageRefRecord = this.imageReferences.get(currentImageReferenceID).toJS()
            imageRefRecord.images = images
            this.imageReferences.set(currentImageReferenceID, new this.imageReferences.model(imageRefRecord))
            })
          resolve(res)
        })
        .catch(reject)
      } else reject('The imageReferenceID and scrollVersionID inputs were of different lengths.')
    }) 
  }

  populateArtefactsOfCombination(scrollID, scrollVersionID) {
    return new Promise((resolve, reject) => {
      this.artefacts.populate(
        {
          transaction: 'getScrollArtefacts',
          scroll_id: scrollID,
        },
        scrollVersionID
      )
      .then(res => {
        scrollVersionID = scrollVersionID >>> 0
        let artefacts = []
        res.forEach(artefact => {
          artefacts.push(artefact[this.artefacts.idKey])
          let imageRefRecord = this.imageReferences.get(artefact.image_catalog_id).toJS()
          imageRefRecord.artefacts.push(artefact[this.artefacts.idKey])
          this.imageReferences.set(artefact.image_catalog_id, new this.imageReferences.model(imageRefRecord))
        })

        let combinationRecord = this.combinations.get(scrollVersionID).toJS()
        combinationRecord.artefacts = [...new Set([...combinationRecord.artefacts, ...artefacts])]
        this.combinations.set(scrollVersionID, new this.combinations.model(combinationRecord))

        resolve(res)
      })
      .catch(reject)
    }) 
  }

  populateArtefactsOfImageReference(imageReferenceID, scrollVersionID) {
    if (imageReferenceID.constructor !== Array) imageReferenceID = [imageReferenceID]
    // If scrollVersionID is not an array, convert it into one matching the
    // length of imageReferenceID.
    if (scrollVersionID.constructor !== Array) {
      const tempScrollVersionID = scrollVersionID
      scrollVersionID = []
      imageReferenceID.forEach(ref => {
        scrollVersionID.push(tempScrollVersionID)
      })
    }
    return new Promise((resolve, reject) => {
      if(imageReferenceID.length === scrollVersionID.length) {
        let payload = {requests: []}
        imageReferenceID.forEach((id, index) => {
          payload.requests.push({image_catalog_id: id, scroll_version_id: scrollVersionID[index], transaction: this.artefacts.standardTransaction})
        })
        this.artefacts.populate(payload)
        .then(res => {
          res.forEach((reply, index) => {
            const currentScrollVersionID = scrollVersionID[index] >>> 0
            const currentImageReferenceID = imageReferenceID[index] >>> 0
            let artefacts = []
            reply.results.forEach(artefact => {
              if (artefact[this.artefacts.idKey]) artefacts.push(artefact[this.artefacts.idKey])
            })
            let imageRefRecord = this.imageReferences.get(currentImageReferenceID).toJS()
            imageRefRecord.artefacts = artefacts
            this.imageReferences.set(currentImageReferenceID, new this.imageReferences.model(imageRefRecord))

            let combinationRecord = this.combinations.get(currentScrollVersionID).toJS()
            combinationRecord.artefacts = [...new Set([...combinationRecord.artefacts, ...artefacts])]
            this.combinations.set(currentScrollVersionID, new this.combinations.model(combinationRecord))
          })
          resolve(res)
        })
        .catch(reject)
      } else reject('The imageReferenceID and scrollVersionID inputs were of different lengths.')
    }) 
  }
}