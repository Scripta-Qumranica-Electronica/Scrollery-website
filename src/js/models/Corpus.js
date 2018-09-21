// Import discrete data model/controllers
import SignCharAttributeList from './SignCharAttributeList.js'
import Combinations from './Combinations.js'
import ImageReferences from './ImageReferences.js'
import Cols from './Cols.js'
import Lines from './Lines.js'
import Signs from './Signs.js'
import SignChars from './SignChars.js'
import SignCharAttributes from './SignCharAttributes.js'
import Images from './Images.js'
import Artefacts from './Artefacts.js'
import ROIs from './ROIs.js'

// Import transaction watcher
import Transactions from './Transactions.js'

// Import backend communication libraries.
import Post from '~/utils/AxiosPostShim.js' // Remove this soon.
import io from 'socket.io-client' // This will now be used instead

import uuid from 'uuid/v1'

// import ClipperLib from 'js-clipper/clipper'

/**
 * A corpus is collection of all material objects in a collection and
 * the data related to them.  A corpus is comprised of combinations.
 * Combinations will typically have columns, lines, images, artefacts and ROI's.
 * The textual data is organized by a linked list of signs.  These signs are
 * linked to signChars, which have their own signCharAttributes, and
 * are related to combinations, columns, and lines.  Signs can also be related
 * to images via ROI's.
 *
 * The models here are rather flat (e.g., normalized) representations of
 * data in the database.  They contain internally all the logic necessary
 * to synchronize in realtime with the backend database and with each other.
 * Functions starting with _ are private.  Do not use them!
 */
export default class Corpus {
  /**
   * @param {user} Number         the user id for the model
   * @param {session_id} String   the id of the current session
   */
  constructor(user, session_id) {
    this.user = user
    this.session_id = session_id
    // We are switching from axios to socket.io
    // for backend communication.
    this.axios = new Post(session_id)
    this.socket = io()

    // This tracks status of socket.io requests
    this.transactions = new Transactions(this)

    // These are the individual data objects.
    // They all receive an instance in this Corpus
    // object and interact with each other as
    // data objects/controllers.
    this.signCharAttributeList = new SignCharAttributeList(this)
    this.combinations = new Combinations(this)
    this.imageReferences = new ImageReferences(this)
    this.cols = new Cols(this)
    this.lines = new Lines(this)
    this.signs = new Signs(this)
    this.signChars = new SignChars(this)
    this.signCharAttributes = new SignCharAttributes(this)
    this.images = new Images(this)
    this.artefacts = new Artefacts(this)
    this.rois = new ROIs(this)
  }

  request(transaction, message) {
    const transactionID = uuid()
    this.transactions.startRequests(transactionID, transaction)
    this.socket.emit(
      transaction,
      Object.assign({ SESSION_ID: this.session_id }, message, { transactionID: transactionID })
    )
    return transactionID
  }
  response(promise) {
    promise.then(msg => {
      if (msg) this.transactions.finishRequest(msg.payload.transactionID)
    })
  }
}
