import MenuObject from './MenuObject.js'
import axios from 'axios'

/**
 * A combination is complete material object.
 * 
 * A combination is comprised of a number of images and columns.
 * 
 * @class
 */
class MenuArtefacts extends MenuObject {

  /**
   * @param {object}          attributes the image attributes
   * @param {array.<MenuImage>=[]} [images]    an array of images
   */
  constructor(sessionID, user, set, itemIDKey, ajaxPayload) {
    itemIDKey = itemIDKey || 'artefact_id'
    ajaxPayload = ajaxPayload || {transaction: 'getArtOfImage',}
    super(sessionID, user, set, itemIDKey, ajaxPayload)
  }

  // We should eventually have a hash associated with each mask,
  // and should be prepared to recieve a message back from the server
  // saying "nothing changed" and then we can leave the artefact alone.
  fetchMask(scrollVersionID, artefactID) {
    let payload = {
      transaction: 'getArtefactMask',
      SESSION_ID: this.sessionID,
      scrollVersion: scrollVersionID,
      artID: artefactID
    }

    return new Promise((resolve, reject) => {
      try {
        axios.post('resources/cgi-bin/scrollery-cgi.pl', payload)
        .then(res => {
            if (res.status === 200 && res.data.results) {

              // We can store hashes for the returned data
              // in the future, so we can avoid unnecessary
              // data transmission.
              this.set(this._items[artefactID], 'hash', res.data.results[0].hash)

              this.set(this._items[artefactID], 'mask', res.data.results[0].poly)
              this.set(this._items[artefactID], 'transformMatrix', res.data.results[0].transform_matrix)
              resolve(res.data.results)
            }
        })
      } catch (err) {
          reject(err);
      }
    })
  }
}

export default MenuArtefacts