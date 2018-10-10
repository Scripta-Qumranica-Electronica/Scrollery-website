import ItemList from './ItemList.js'
// import Artefact from './Artefact.js'
import uuid from 'uuid/v1'
import SvgPath from 'svgpath'
import { pathIdentifier } from '~/utils/PathIdentifier.js'
import {
  svgPolygonToWKT,
  geoJSONPolygonToWKT,
  wktPolygonToSvg,
  wktParseRect,
  dbMatrixToSVG,
} from '~/utils/VectorFactory.js'

export default class Artefacts extends ItemList {
  constructor(corpus, idKey, defaultPostData = undefined) {
    idKey = idKey || 'artefact_id'
    const listType = 'artefacts'
    const connectedLists = [corpus.combinations, corpus.imageReferences,]
    const relativeToScrollVersion = true
    defaultPostData = defaultPostData ? defaultPostData : { transaction: 'requestArtOfImage' }
    super(corpus, idKey, listType, connectedLists, relativeToScrollVersion, defaultPostData)

    // Setup socket.io listeners
    this.socket.on('receiveArtOfImage', msg => {
      this.corpus.response(this.processPopulate(msg))
    })
  }

  formatRecord(record) {
    return {
      artefact_position_id: ~~record.artefact_position_id, // Ensure positive integer with bitwise operator
      artefact_id: ~~record.artefact_id, // Ensure positive integer with bitwise operator
      artefact_shape_id: ~~record.artefact_shape_id, // Ensure positive integer with bitwise operator
      scroll_version_id: ~~record.scroll_version_id, // Ensure positive integer with bitwise operator
      name: record.name,
      side: ~~record.side, // Ensure positive integer with bitwise operator
      mask: record.mask,
      svgInCombination:
        record.mask &&
        record.rect &&
        record.transform_matrix &&
        SvgPath(wktPolygonToSvg(record.mask, wktParseRect(record.rect)))
          .matrix(dbMatrixToSVG(record.transform_matrix))
          .round()
          .toString(),
      transform_matrix: record.transform_matrix,
      rect: record.rect,
      image_catalog_id: ~~record.image_catalog_id, // Ensure positive integer with bitwise operator
      id_of_sqe_image: ~~record.id_of_sqe_image, // Ensure positive integer with bitwise operator
      catalog_side: ~~record.catalog_side, // Ensure positive integer with bitwise operator
      rois: record.rois || [],
    }
  }

  /* istanbul ignore next */
  updateArtefactShape(artefact_id, scroll_version_id, shape) {
    shape = Array.isArray(shape) ? shape : [shape,]
    artefact_id = Array.isArray(artefact_id) ? artefact_id : [artefact_id,]
    scroll_version_id = Array.isArray(scroll_version_id) ? scroll_version_id : [scroll_version_id,]
    return new Promise((resolve, reject) => {
      if (shape.length === artefact_id.length && shape.length === scroll_version_id.length) {
        const payload = { requests: [], SESSION_ID: this.session_id, }
        for (
          let index = 0, svgMask, currentArtefactID, currentScrollVersionID;
          (svgMask = shape[index]) &&
          (currentArtefactID = artefact_id[index]) &&
          (currentScrollVersionID = scroll_version_id[index]);
          index++
        ) {
          let maskWKT = undefined
          switch (pathIdentifier(svgMask)) {
          case 'SVG':
            maskWKT = svgPolygonToWKT(svgMask)
            break
          case 'WKT':
            maskWKT = svgMask
            break
          case 'GeoJSON':
            maskWKT = geoJSONPolygonToWKT(svgMask)
            break
          case 'GeoJSON String':
            maskWKT = geoJSONPolygonToWKT(svgMask)
            break
          }
          payload.requests.push({
            region_in_master_image: maskWKT,
            artefact_id: currentArtefactID,
            scroll_version_id: currentScrollVersionID,
            image_catalog_id: this.get(currentArtefactID, currentScrollVersionID).image_catalog_id,
            id_of_sqe_image: this.get(currentArtefactID, currentScrollVersionID).id_of_sqe_image,
            transaction: 'changeArtefactShape',
          })
          this.alterItemAtKey(currentArtefactID, { mask: maskWKT, }, currentScrollVersionID)
        }
        this.axios
          .post('resources/cgi-bin/scrollery-cgi.pl', payload)
          .then(res => {
            if (res.status === 200 && res.data) {
              resolve(res.data)
            }
          })
          .catch(err => {
            console.error(err)
          })
      } else {
        reject(
          'The mask, artefact_shape_id, and scroll_version_id inputs were of different lengths.'
        )
      }
    })
  }

  /* istanbul ignore next */
  updateName(item_id, name, scroll_version_id) {
    return super.updateName(item_id, name, scroll_version_id, 'changeArtefactData')
  }

  /* istanbul ignore next */
  addNewArtefact(scroll_version_id, id_of_sqe_image, image_catalog_id, region_in_master_image) {
    const payload = {
      scroll_version_id: scroll_version_id,
      id_of_sqe_image: id_of_sqe_image,
      image_catalog_id: image_catalog_id,
      region_in_master_image: region_in_master_image,
      transaction: 'addArtefact',
    }
    return new Promise((resolve, reject) => {
      this.axios
        .post('resources/cgi-bin/scrollery-cgi.pl', payload)
        .then(res => {
          if (res.status === 200 && res.data) {
            this.axios
              .post('resources/cgi-bin/scrollery-cgi.pl', {
                transaction: 'changeArtefactPosition',
                scroll_version_id: res.data.payload.scroll_version_id,
                artefact_id: res.data.returned_info,
                transform_matrix: '{"matrix":[[1,0,0],[0,1,0]]}',
                image_catalog_id: res.data.payload.image_catalog_id,
                z_index: 0,
              })
              .then(res => {
                this.axios
                  .post('resources/cgi-bin/scrollery-cgi.pl', {
                    transaction: 'changeArtefactData',
                    scroll_version_id: res.data.payload.scroll_version_id,
                    artefact_id: res.data.payload.artefact_id,
                    image_catalog_id: res.data.payload.image_catalog_id,
                    name: uuid(),
                  })
                  .then(res => {
                    resolve(
                      this.populate({
                        image_catalog_id: res.data.payload.image_catalog_id,
                        scroll_version_id: res.data.payload.scroll_version_id,
                      })
                    )
                  })
              })
          }
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  /* istanbul ignore next */
  removeItem(key, scroll_version_id) {
    /**
     * Add axios command to remove from database.
     * run super on successful completion.
     */
    return new Promise((resolve, reject) => {
      const postData = {
        transaction: 'removeArtefact',
        scroll_version_id: scroll_version_id,
        artefact_id: key,
      }
      try {
        this.axios.post('resources/cgi-bin/scrollery-cgi.pl', postData).then(res => {
          if (res.data && res.data[key] === 'deleted') {
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
