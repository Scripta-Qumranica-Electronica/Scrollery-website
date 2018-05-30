import MapList from './MapList.js'
import ROI from './ROI.js'
import axios from 'axios'
import { wktPolygonToSvg, dbMatrixToSVG } from '~/utils/VectorFactory.js'
const svgpath = require('svgpath')

export default class ROIs extends MapList {
  constructor(
    session_id,
    idKey,
    ajaxPayload = undefined,
    attributes = {},
    standardTransaction = undefined
  ) {
    idKey = idKey || 'sign_char_roi_id'
    standardTransaction = 'getRoiOfCol'
    super(session_id, idKey, ajaxPayload, ROI, attributes, standardTransaction)
  }

  // TODO: mocking for axios in unit test
  /* istanbul ignore next */
  populate(customPayload = {}, scrollVersionID = undefined) {
    let payload = Object.assign(
      {},
      this._ajaxPayload,
      customPayload,
      scrollVersionID && { scroll_version_id: scrollVersionID }
    )

    return new Promise((resolve, reject) => {
      try {
        axios.post('resources/cgi-bin/scrollery-cgi.pl', payload).then(res => {
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
            res.data.replies.forEach(reply => {
              if (reply.error) {
                return
              }

              reply.results.forEach(item => {
                let record
                if (this.get(item[this.idKey]) && this.get(item[this.idKey]).toJS() !== item) {
                  record = this.get(item[this.idKey]).extend(item)
                } else if (!this.get(item[this.idKey])) {
                  record = new this.model(item)
                }
                if (record) {
                  record.svgInCombination = svgpath(wktPolygonToSvg(record.path))
                    .matrix(dbMatrixToSVG(record.transform_matrix))
                    .round()
                    .toString()
                  results.push([item[this.idKey], record])
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
}
