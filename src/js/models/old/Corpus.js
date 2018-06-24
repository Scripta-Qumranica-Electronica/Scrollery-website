import Combinations from './Combinations.js'
import ImageReferences from './imageReferences.js'
import Cols from './Cols.js'
import Images from './Images.js'
import Artefacts from './Artefacts.js'
import ROIs from './ROIs.js'
import {
  dbMatrixToSVG,
  svgMatrixToDB,
  svgPolygonToWKT,
  svgPolygonToGeoJSON,
  svgPolygonToClipper,
  wktPolygonToSvg,
  wktParseRect,
} from '~/utils/VectorFactory.js'
import ClipperLib from 'js-clipper/clipper'
import axios from 'axios'

import { polygon } from '@turf/helpers'
import booleanOverlap from '@turf/boolean-overlap'

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
  constructor(user, session_id) {
    this._user = user
    this.session_id = session_id

    this.combinations = new Combinations(this._user, this.session_id)
    this.imageReferences = new ImageReferences(this.session_id)
    this.cols = new Cols(this.session_id)
    this.images = new Images(this.session_id)
    this.artefacts = new Artefacts(this.session_id)
    this.rois = new ROIs(this.session_id)
  }

  /* TODO I ignore this for testing until I decide on
  * a set model.  Write tests when that has been
  * determined!
  */

  /* istanbul ignore next */
  populateCombinations() {
    return new Promise((resolve, reject) => {
      this.combinations
        .populate()
        .then(resolve)
        .catch(reject)
    })
  }

  /* TODO I ignore this for testing until I decide on
  * a set model.  Write tests when that has been
  * determined!
  */

  /* istanbul ignore next */
  populateColumnsOfCombination(scrollID, scrollVersionID) {
    if (scrollVersionID.constructor !== Array) scrollVersionID = [scrollVersionID]
    if (scrollID.constructor !== Array) scrollID = [scrollID]
    return new Promise((resolve, reject) => {
      let payload = { requests: [] }
      if (scrollID.length === scrollVersionID.length) {
        scrollVersionID.forEach((id, index) => {
          payload.requests.push({
            combID: scrollID[index],
            scroll_version_id: id,
            transaction: this.cols.standardTransaction,
          })
        })
        this.cols
          .populate(payload)
          .then(res => {
            res.forEach((reply, index) => {
              const currentScrollVersionID = scrollVersionID[index] >>> 0
              let cols = []
              reply.results.forEach(item => {
                if (item[this.cols.idKey]) cols.push(item[this.cols.idKey])
              })
              let combinationRecord = this.combinations.get(currentScrollVersionID)
              combinationRecord.cols = cols
              this.combinations.set(
                currentScrollVersionID,
                new this.combinations.model(combinationRecord)
              )
            })
            resolve(res)
          })
          .catch(reject)
      } else reject(new Error('The scrollID and scrollVersion inputs were of different lengths.'))
    })
  }

  /* TODO I ignore this for testing until I decide on
  * a set model.  Write tests when that has been
  * determined!
  */

  /* istanbul ignore next */
  populateImageReferencesOfCombination(scrollID, scrollVersionID) {
    if (scrollVersionID.constructor !== Array) scrollVersionID = [scrollVersionID]
    if (scrollID.constructor !== Array) scrollID = [scrollID]
    return new Promise((resolve, reject) => {
      if (scrollID.length === scrollVersionID.length) {
        let payload = { requests: [] }
        scrollVersionID.forEach((id, index) => {
          payload.requests.push({
            combID: scrollID[index],
            scrollVersionID: id,
            transaction: this.imageReferences.standardTransaction,
          })
        })
        this.imageReferences
          .populate(payload)
          .then(res => {
            res.forEach((reply, index) => {
              const currentScrollVersionID = scrollVersionID[index] >>> 0
              let imageRefs = []
              reply.results.forEach(imageReference => {
                if (imageReference.id) imageRefs.push(imageReference.id)
              })
              let combinationRecord = this.combinations.get(currentScrollVersionID).toJS()
              combinationRecord.imageReferences = imageRefs
              this.combinations.set(
                currentScrollVersionID,
                new this.combinations.model(combinationRecord)
              )
            })
            resolve(res)
          })
          .catch(reject)
      } else reject(new Error('The scrollID and scrollVersion inputs were of different lengths.'))
    })
  }

  /* TODO I ignore this for testing until I decide on
  * a set model.  Write tests when that has been
  * determined!
  */

  /* istanbul ignore next */
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
      if (imageReferenceID.length === scrollVersionID.length) {
        let payload = { requests: [] }
        imageReferenceID.forEach((id, index) => {
          payload.requests.push({
            id: id,
            scrollVersionID: scrollVersionID[index],
            transaction: this.images.standardTransaction,
          })
        })
        this.images
          .populate(payload)
          .then(res => {
            res.forEach((reply, index) => {
              const currentImageReferenceID = imageReferenceID[index] >>> 0
              let images = []
              reply.results.forEach(image => {
                if (image[this.images.idKey]) images.push(image[this.images.idKey])
              })
              let imageRefRecord = this.imageReferences.get(currentImageReferenceID).toJS()
              imageRefRecord.images = images
              this.imageReferences.set(
                currentImageReferenceID,
                new this.imageReferences.model(imageRefRecord)
              )
            })
            resolve(res)
          })
          .catch(reject)
      } else reject('The imageReferenceID and scrollVersionID inputs were of different lengths.')
    })
  }

  /* TODO I ignore this for testing until I decide on
  * a set model.  Write tests when that has been
  * determined!
  */

  /* istanbul ignore next */
  populateArtefactsOfCombination(scrollVersionID) {
    return new Promise((resolve, reject) => {
      this.artefacts
        .populate(
          {
            transaction: 'getScrollArtefacts',
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
            this.imageReferences.set(
              artefact.image_catalog_id,
              new this.imageReferences.model(imageRefRecord)
            )
          })

          let combinationRecord = this.combinations.get(scrollVersionID).toJS()
          combinationRecord.artefacts = [...new Set([...combinationRecord.artefacts, ...artefacts])]
          this.combinations.set(scrollVersionID, new this.combinations.model(combinationRecord))

          resolve(res)
        })
        .catch(reject)
    })
  }

  /* TODO I ignore this for testing until I decide on
  * a set model.  Write tests when that has been
  * determined!
  */

  /* istanbul ignore next */
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
      if (imageReferenceID.length === scrollVersionID.length) {
        let payload = { requests: [] }
        imageReferenceID.forEach((id, index) => {
          payload.requests.push({
            image_catalog_id: id,
            scroll_version_id: scrollVersionID[index],
            transaction: this.artefacts.standardTransaction,
          })
        })
        this.artefacts
          .populate(payload)
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
              this.imageReferences.set(
                currentImageReferenceID,
                new this.imageReferences.model(imageRefRecord)
              )

              let combinationRecord = this.combinations.get(currentScrollVersionID).toJS()
              combinationRecord.artefacts = [
                ...new Set([...combinationRecord.artefacts, ...artefacts]),
              ]
              this.combinations.set(
                currentScrollVersionID,
                new this.combinations.model(combinationRecord)
              )
            })
            resolve(res)
          })
          .catch(reject)
      } else reject('The imageReferenceID and scrollVersionID inputs were of different lengths.')
    })
  }

  /* TODO I ignore this for testing until I decide on
  * a set model.  Write tests when that has been
  * determined!
  */

  /* istanbul ignore next */
  populateRoisOfCombination(scrollID, scrollVersionID) {
    if (scrollVersionID.constructor !== Array) scrollVersionID = [scrollVersionID]
    if (scrollID.constructor !== Array) scrollID = [scrollID]

    return new Promise((resolve, reject) => {
      let payload = { requests: [] }
      scrollVersionID.forEach((id, index) => {
        payload.requests.push({
          scroll_id: scrollID[index],
          scroll_version_id: scrollVersionID[index],
          transaction: 'getRoisOfCombination',
        })
      })
      this.rois
        .populate(payload)
        .then(res => {
          res.forEach((reply, index) => {
            const currentScrollVersionID = scrollVersionID[index] >>> 0
            let rois = []
            reply.results.forEach(roi => {
              if (roi[this.rois.idKey]) rois.push(roi[this.rois.idKey])
            })

            let combinationRecord = this.combinations.get(currentScrollVersionID).toJS()
            combinationRecord.rois = rois
            this.combinations.set(
              currentScrollVersionID,
              new this.combinations.model(combinationRecord)
            )
          })
          resolve(res)
        })
        .catch(reject)
    })
  }

  /* TODO I ignore this for testing until I decide on
  * a set model.  Write tests when that has been
  * determined!
  */

  /* istanbul ignore next */
  populateRoiOfCol(colID, scrollVersionID) {
    if (colID.constructor !== Array) colID = [colID]
    // If scrollVersionID is not an array, convert it into one matching the
    // length of imageReferenceID.
    if (scrollVersionID.constructor !== Array) {
      const tempScrollVersionID = scrollVersionID
      scrollVersionID = []
      colID.forEach(ref => {
        scrollVersionID.push(tempScrollVersionID)
      })
    }
    return new Promise((resolve, reject) => {
      if (colID.length === scrollVersionID.length) {
        let payload = { requests: [] }
        colID.forEach((id, index) => {
          payload.requests.push({
            col_id: id,
            scroll_version_id: scrollVersionID[index],
            transaction: this.rois.standardTransaction,
          })
        })
        this.rois
          .populate(payload)
          .then(res => {
            res.forEach((reply, index) => {
              const currentScrollVersionID = scrollVersionID[index] >>> 0
              const currentColID = colID[index] >>> 0
              let rois = []
              reply.results.forEach(roi => {
                if (roi[this.rois.idKey]) rois.push(roi[this.rois.idKey])
              })

              let colRecord = this.cols.get(currentColID).toJS()
              colRecord.rois = rois
              this.cols.set(currentColID, new this.cols.model(colRecord))

              let combinationRecord = this.combinations.get(currentScrollVersionID).toJS()
              combinationRecord.rois = rois
              this.combinations.set(
                currentScrollVersionID,
                new this.combinations.model(combinationRecord)
              )
            })
            resolve(res)
          })
          .catch(reject)
      } else reject('The colID and scrollVersionID inputs were of different lengths.')
    })
  }

  /* TODO I ignore this for testing until I decide on
  * a set model.  Write tests when that has been
  * determined!
  */

  /* istanbul ignore next */
  cloneScroll(scroll_version_id) {
    const payload = {
      SESSION_ID: this.session_id,
      scroll_version_id: scroll_version_id,
      transaction: 'copyCombination',
    }
    axios
      .post('resources/cgi-bin/scrollery-cgi.pl', payload)
      .then(res => {
        if (res.status === 200 && res.data && res.data.scroll_data) {
          // We can store hashes for the returned data
          // in the future, so we can avoid unnecessary
          // data transmission.
          // this._hash = res.data.hash

          const scroll_data = res.data.scroll_data
          let record = new this.combinations.model(scroll_data)
          this.combinations.insert(record, this.combinations.getFirstKey())
          this.populateColumnsOfCombination(scroll_data.scroll_id, scroll_data.scroll_version_id)
          this.populateImageReferencesOfCombination(
            scroll_data.scroll_id,
            scroll_data.scroll_version_id
          ).then(res => {
            this.populateArtefactsOfCombination(
              scroll_data.scroll_id,
              scroll_data.scroll_version_id
            )
          })
        }
      })
      .catch(error => {
        console.log(error.response)
      })
  }

  /* TODO I ignore this for testing until I decide on
  * a set model.  Write tests when that has been
  * determined!
  */

  /* istanbul ignore next */
  changeArtefactMask(region_in_sqe_image, artefact_position_id, scroll_version_id) {
    region_in_sqe_image = Array.isArray(region_in_sqe_image)
      ? region_in_sqe_image
      : [region_in_sqe_image]
    artefact_position_id = Array.isArray(artefact_position_id)
      ? artefact_position_id
      : [artefact_position_id]
    return new Promise((resolve, reject) => {
      if (region_in_sqe_image.length === artefact_position_id.length) {
        if (
          Array.isArray(scroll_version_id) &&
          region_in_sqe_image.length !== scroll_version_id.length
        ) {
          reject(
            'The mask, artefact_shape_id, and scroll_version_id inputs were of different lengths.'
          )
        } else {
          const singleScrollVersionID = scroll_version_id
          scroll_version_id = []
          for (let i = 0, length = region_in_sqe_image.length; i < length; i++) {
            scroll_version_id.push(singleScrollVersionID)
          }
          let payload = { requests: [], SESSION_ID: this.session_id }
          for (let index = 0, svgMask; (svgMask = region_in_sqe_image[index]); index++) {
            const maskWKT = svgPolygonToWKT(svgMask)
            payload.requests.push({
              region_in_sqe_image: maskWKT,
              artefact_position_id: artefact_position_id[index],
              scroll_version_id: scroll_version_id[index],
              transaction: 'changeArtefactPoly',
            })
            let currentArtefact = this.artefacts.get(artefact_position_id[index]).toJS()
            currentArtefact.mask = maskWKT
            this.artefacts.set(
              artefact_position_id[index],
              new this.artefacts.model(currentArtefact)
            )
          }
          axios
            .post('resources/cgi-bin/scrollery-cgi.pl', payload)
            .then(res => {
              if (res.status === 200 && res.data) {
                for (let index = 0, artefact; (artefact = res.data.replies[index]); index++) {
                  let currentArtefact = this.artefacts.get(artefact.artefact_position_id).toJS()
                  currentArtefact.artefact_shape_id = artefact.artefact_shape_id
                  this.artefacts.set(
                    artefact.artefact_id,
                    new this.artefacts.model(currentArtefact)
                  )
                }
                resolve(res.data)
              }
            })
            .catch(error => {
              console.log(error.response)
            })
        }
      } else {
        reject('The mask and artefact_shape_id inputs were of different lengths.')
      }
    })
  }

  /* TODO I ignore this for testing until I decide on
  * a set model.  Write tests when that has been
  * determined!
  */

  /* istanbul ignore next */
  setRoiOfArtefact(sign_char_roi_id, roi, artefact_position_id, scroll_version_id) {
    if (sign_char_roi_id.constructor !== Array) sign_char_roi_id = [sign_char_roi_id]
    if (roi.constructor !== Array) roi = [roi]
    // If scroll_version_id is not an array, convert it into one matching the
    // length of imageReferenceID.
    if (scroll_version_id.constructor !== Array) {
      const tempScrollVersionID = scroll_version_id
      scroll_version_id = []
      sign_char_roi_id.forEach(ref => {
        scroll_version_id.push(tempScrollVersionID)
      })
    }
    if (artefact_position_id.constructor !== Array) {
      const tempArtefactPositionID = artefact_position_id
      artefact_position_id = []
      sign_char_roi_id.forEach(ref => {
        artefact_position_id.push(tempArtefactPositionID)
      })
    }

    return new Promise((resolve, reject) => {
      if (
        sign_char_roi_id.length === roi.length &&
        sign_char_roi_id.length === scroll_version_id.length &&
        scroll_version_id.length === artefact_position_id.length
      ) {
        let payload = { requests: {}, SESSION_ID: this.session_id }
        sign_char_roi_id.forEach((id, index) => {
          let currentROI = roi[index]
          console.log(artefact_position_id[index])
          console.log(this.artefacts.get(artefact_position_id[index]))
          let roiMatrix = dbMatrixToSVG(
            this.artefacts.get(artefact_position_id[index]).transform_matrix
          )
          const artefactRect = wktParseRect(this.artefacts.get(artefact_position_id[index]).rect)
          roiMatrix[4] = roiMatrix[4] + currentROI.x - artefactRect.x
          roiMatrix[5] = roiMatrix[5] + currentROI.y - artefactRect.y
          const roiGeoJSONPath = {
            type: 'Polygon',
            coordinates: [
              [0, 0],
              [currentROI.width, 0],
              [currentROI.width, currentROI.height],
              [0, currentROI.height],
              [0, 0],
            ],
          }
          const roiWKTPath = `Polygon((0 0, ${currentROI.width} 0, ${currentROI.width} ${
            currentROI.height
          }, 0 ${currentROI.height}, 0 0))`
          // Create the roi locally
          let roiRecord
          if (!this.rois.get(id)) {
            roiRecord = new this.rois.model({
              sign_char_roi_id: id,
              sign_char_id: 0,
              path: roiWKTPath,
              transform_matrix: roiMatrix,
            })
          } else {
            roiRecord = this.rois.get(id).toJS()
            roiRecord.path = roiWKTPath
            roiRecord.transform_matrix = roiMatrix
          }
          this.rois.set(id, roiRecord)

          // Create the roi on the server database
          if (isNaN(sign_char_roi_id)) {
            payload.requests[id] = {
              path: roiWKTPath,
              transform_matrix: svgMatrixToDB(roiMatrix),
              scroll_version_id: scroll_version_id[index],
              values_set: 1,
              exceptional: 0,
              transaction: 'addRoiToScroll',
            }
          } else {
            payload.requests[id] = {
              sign_char_roi_id: id,
              path: roiWKTPath,
              transform_matrix: svgMatrixToDB(roiMatrix),
              scroll_version_id: scroll_version_id[index],
              values_set: 1,
              exceptional: 0,
              transaction: 'changeROI',
            }
          }
        })
        axios
          .post('resources/cgi-bin/scrollery-cgi.pl', payload)
          .then(res => {
            for (const [key, value] of Object.entries(res.data.replies)) {
              //TODO I really need the CGI API to return for me the sign_char_roi_id.
              //This function is WRONG in that it uses the sign_char_id for the index,
              //the sign_char_roi_id is supposed to be used for that instead.
              let roi = this.rois.get(key).toJS()
              roi.sign_char_id = value.sign_char_id
              this.rois.delete(key)
              this.rois.set(value.sign_char_id, new this.rois.model(roi))
            }
          })
          .catch(error => {
            console.log(error.response)
          })
      } else
        reject(
          'The sign_char_roi_id, roi, artefact_position_id, and scroll_version_id inputs were of different lengths.'
        )
    })
  }

  /*
   *
   * This takes a list of rois ids and a list of artefact ids.
   * It loops through every combination and adds the roi id
   * to any artefact that it overlaps.
   * 
   */
  /* TODO I ignore this for testing until I decide on
  * a set model.  Write tests when that has been
  * determined!
  */

  /* istanbul ignore next */
  mapRoisToArtefacts(rois, artefacts) {
    artefacts.forEach(artefactID => {
      rois.forEach(roiID => {
        // if (
        //   !reader
        //     .read(svgPolygonToWKT(this.artefacts.get(artefactID).svgInCombination))
        //     .intersection(svgPolygonToWKT(this.rois.get(roiID).svgInCombination))
        //     .isEmpty()
        // ) {
        //   let update = this.artefacts.get(artefactID).toJS()
        //   update.rois.push(roiID)
        //   this.artefacts.set(artefactID, new this.artefacts.model(update))
        //   console.log(roiID, 'is inside', artefactID)
        // }
      })
    })
  }

  /*
   *
   * This takes a scroll version id. It loops through every combination 
   * of roi and artefact, then adds the roi id
   * to any artefact that it overlaps.
   * 
   */
  /* TODO I ignore this for testing until I decide on
  * a set model.  Write tests when that has been
  * determined!
  */

  /* istanbul ignore next */
  mapRoisAndArtefactsInCombination(scroll_version_id) {
    console.time('overLapSearch')
    this.combinations.get(scroll_version_id).artefacts.forEach(artefactID => {
      let currentArtefact = polygon(
        svgPolygonToGeoJSON(this.artefacts.get(artefactID).svgInCombination).coordinates
      )
      // console.log(artefactSVG.toText())

      this.combinations.get(scroll_version_id).rois.forEach(roiID => {
        let currentROI = polygon(
          svgPolygonToGeoJSON(this.rois.get(roiID).svgInCombination).coordinates
        )
        if (booleanOverlap(currentArtefact, currentROI)) {
          console.log('We have overlap between ROI', roiID, 'and Artefact', artefactID)
          console.log(currentArtefact)
          console.log(currentROI)
        } else {
          console.log('No overlap')
        }
        // let roiSVG = reader.read(svgPolygonToWKT(this.rois.get(roiID).svgInCombination))

        // // console.log(roiSVG.toText())
        // if (roiSVG.isValid() && artefactSVG.isValid()) {
        //   let intersection = artefactSVG.intersection(roiSVG)
        //   if (!intersection.isEmpty()) {
        //     let update = this.artefacts.get(artefactID).toJS()
        //     update.rois.push(roiID)
        //     this.artefacts.set(artefactID, new this.artefacts.model(update))
        //     console.log(roiID, 'is inside', artefactID)
        //   }
        // } else {
        //   if (!roiSVG.isValid()) {
        //     console.log('ROI', roiID, 'is invalid.')
        //   }
        // }
      })
    })
    console.timeEnd('overLapSearch')
  }
}