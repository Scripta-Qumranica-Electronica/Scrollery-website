import MapList from './MapList.js'
import Artefact from './Artefact.js'
import { post } from '~/utils/AxiosPostShim.js'
import { wktPolygonToSvg, wktParseRect, dbMatrixToSVG } from '~/utils/VectorFactory.js'
const svgpath = require('svgpath')

export default class Artefacts extends MapList {
  constructor(
    session_id,
    idKey,
    ajaxPayload = undefined,
    attributes = {},
    standardTransaction = undefined
  ) {
    idKey = idKey || 'artefact_id'
    standardTransaction = 'getArtOfImage'
    // ajaxPayload = ajaxPayload ? ajaxPayload : {transaction: 'getArtOfImage'}
    super(session_id, idKey, ajaxPayload, Artefact, attributes, standardTransaction)
  }

  // We should eventually have a hash associated with each mask,
  // and should be prepared to recieve a message back from the server
  // saying "nothing changed" and then we can leave the artefact alone.

  // TODO: mocking for axios in unit test
  /* istanbul ignore next */
  populate(customPayload = {}, scroll_version_id = undefined) {
    let payload = Object.assign(
      {},
      this._ajaxPayload,
      customPayload,
      scroll_version_id && { scroll_version_id: scroll_version_id }
    )

    return new Promise((resolve, reject) => {
      try {
        post('resources/cgi-bin/scrollery-cgi.pl', payload).then(res => {
          if (res.status === 200 && res.data.replies) {
            // We can store hashes for the returned data
            // in the future, so we can avoid unnecessary
            // data transmission.
            this._hash = res.data.hash

            // Note to self: if you load the data into a 2d array:
            // [[key1, value1],[key2,[value2]] the keys can be
            // loaded into an OrderedMap as integers.  If you use
            // an Object {key1: value1, key2: value2}, then the
            // keys are converted to strings.
            let results = []
            res.data.replies.forEach((reply, index) => {
              if (reply.error) {
                return
              }
              scroll_version_id = res.data.payload.requests[index].scroll_version_id

              reply.results.forEach(item => {
                let record
                if (
                  this.get(scroll_version_id + '-' + item[this.idKey]) &&
                  scroll_version_id + '-' + this.get(item[this.idKey]).toJS() !== item
                ) {
                  record = this.get(scroll_version_id + '-' + item[this.idKey]).extend(item)
                } else if (!this.get(scroll_version_id + '-' + item[this.idKey])) {
                  record = new this.model(item)
                }
                if (record) {
                  record.svgInCombination = svgpath(
                    wktPolygonToSvg(record.mask, wktParseRect(record.rect))
                  )
                    .matrix(dbMatrixToSVG(record.transform_matrix))
                    .round()
                    .toString()
                  results.push([scroll_version_id + '-' + item[this.idKey], record])
                }
              })
            })

            this.merge(results)
            resolve(res.data.replies)
          }
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  // TODO: mocking for axios in unit test
  /* istanbul ignore next */

  // TODO I think this should be deprecated, it is wrong to some extent
  // anway.  We always grab the mask when first initializing the artefact
  // record.

  // fetchMask(scrollVersionID, artefactID) {
  //   console.log('Fetched mask:', artefactID)
  //   scrollVersionID = scrollVersionID >>> 0
  //   artefactID = artefactID >>> 0
  //   let payload = {
  //     transaction: 'getArtefactMask',
  //     SESSION_ID: this.sessionID,
  //     scrollVersion: scrollVersionID,
  //     artID: artefactID,
  //   }

  //   return new Promise((resolve, reject) => {
  //     try {
  //       axios.post('resources/cgi-bin/scrollery-cgi.pl', payload).then(res => {
  //         if (res.status === 200 && res.data.results) {
  //           // We can store hashes for the returned data
  //           // in the future, so we can avoid unnecessary
  //           // data transmission.
  //           this.set(this._items[artefactID], 'hash', res.data.results[0].hash)

  //           let newArtefact = this.get(artefactID).toJS()
  //           newArtefact.mask = wktPolygonToSvg(res.data.results[0].poly)
  //           newArtefact.transform_matrix = dbMatrixToSVG(
  //             JSON.parse(res.data.results[0].transform_matrix).matrix
  //           )
  //           newArtefact.rect = wktPolygonToSvg(res.data.results[0].rect)
  //           this._items.set(artefactID, new this.model(newArtefact))
  //           resolve(res.data.results)
  //         }
  //       })
  //     } catch (err) {
  //       reject(err)
  //     }
  //   })
  // }
}
