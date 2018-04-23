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
    return new Promise((resolve, reject) => {
      this.cols.populate({combID: scrollID}, scrollVersionID)
      .then(res => {
        scrollVersionID = scrollVersionID >>> 0
        let cols = []
        res.forEach(item => {
          cols.push(item[this.cols.idKey])
        })
        let combinationRecord = this.combinations.get(scrollVersionID).toJS()
        combinationRecord.cols = cols
        this.combinations.set(scrollVersionID, new this.combinations.model(combinationRecord))
        resolve(res)
      })
      .catch(reject)
    })
  }

  populateImageReferencesOfCombination(scrollVersionID) {
    return new Promise((resolve, reject) => {
      this.imageReferences.populate({combID: scrollVersionID}, scrollVersionID)
      .then(res => {
        scrollVersionID = scrollVersionID >>> 0
        let imageRefs = []
        res.forEach(item => {
          imageRefs.push(item.id)
        })
        let combinationRecord = this.combinations.get(scrollVersionID).toJS()
        combinationRecord.imageReferences = imageRefs
        this.combinations.set(scrollVersionID, new this.combinations.model(combinationRecord))
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
    return new Promise((resolve, reject) => {
      this.images.populate({id: imageReferenceID}, scrollVersionID)
      .then(res => {
        imageReferenceID = imageReferenceID >>> 0
        let images = []
        res.forEach(image => {
          images.push(image[this.images.idKey])
        })
        let imageRefRecord = this.imageReferences.get(imageReferenceID).toJS()
        imageRefRecord.images = images
        this.imageReferences.set(imageReferenceID, new this.imageReferences.model(imageRefRecord))
        resolve(res)
      })
      .catch(reject)
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
    return new Promise((resolve, reject) => {
      this.artefacts.populate({image_catalog_id: imageReferenceID}, scrollVersionID)
      .then(res => {
        scrollVersionID = scrollVersionID >>> 0
        imageReferenceID = imageReferenceID >>> 0
        let artefacts = []
        res.forEach(artefact => {
          artefacts.push(artefact[this.artefacts.idKey])
        })
        let imageRefRecord = this.imageReferences.get(imageReferenceID).toJS()
        imageRefRecord.artefacts = artefacts
        this.imageReferences.set(imageReferenceID, new this.imageReferences.model(imageRefRecord))

        let combinationRecord = this.combinations.get(scrollVersionID).toJS()
        combinationRecord.artefacts = [...new Set([...combinationRecord.artefacts, ...artefacts])]
        this.combinations.set(scrollVersionID, new this.combinations.model(combinationRecord))

        resolve(res)
      })
      .catch(reject)
    }) 
  }
}