import MapList from './MapList.js'
import Artefact from './Artefact.js'
import axios from 'axios'
import {wktPolygonToSvg, dbMatrixToSVG} from '~/utils/VectorFactory.js'

export default class Artefacts extends MapList {

  constructor(
    sessionID,
    idKey,
    ajaxPayload = undefined,
    attributes = {})
  {
    idKey = idKey || 'artefact_position_id'
    ajaxPayload = ajaxPayload ? ajaxPayload : {transaction: 'getArtOfImage'}
    super(sessionID, idKey, ajaxPayload, Artefact, attributes)
  }

  static getModel() {
    return Artefact
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

              let newArtefact = this._items[artefactID].toJS()
              newArtefact.mask =  wktPolygonToSvg(res.data.results[0].poly)
              newArtefact.transform_matrix = dbMatrixToSVG(JSON.parse(res.data.results[0].transform_matrix).matrix)
              newArtefact.rect = wktPolygonToSvg(res.data.results[0].rect)
              this._items.set(artefact, new this.model(newArtefact))
              resolve(res.data.results)
            }
        })
      } catch (err) {
          reject(err);
      }
    })
  }
}