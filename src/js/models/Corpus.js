import Combinations from './Combinations.js'
import ImageReferences from './ImageReferences.js'
import Cols from './Cols.js'
import Images from './Images.js'
import Artefacts from './Artefacts.js'
import ROIs from './ROIs.js'
import Post from '~/utils/AxiosPostShim.js'
// import ClipperLib from 'js-clipper/clipper'

/**
 * A corpus is collection of all material objects in a collection and the data related to them..
 *
 * A corpus is comprised of combinations, columns, images, artefacts and ROI's.
 *
 * @class
 */
export default class Corpus {
  /**
   * @param {user} Number         the user id for the model
   * @param {session_id} String   the id of the current session
   */
  constructor(user, session_id) {
    this.user = user
    this.session_id = session_id
    this.axios = new Post(session_id)

    this.combinations = new Combinations(this)
    this.imageReferences = new ImageReferences(this)
    this.cols = new Cols(this)
    this.images = new Images(this)
    this.artefacts = new Artefacts(this)
    this.rois = new ROIs(this)
  }
}
