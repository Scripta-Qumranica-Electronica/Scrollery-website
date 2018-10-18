import ItemList from './ItemList.js'
import SvgPath from 'svgpath'
import { wktPolygonToSvg, dbMatrixToSVG } from '~/utils/VectorFactory.js'
// import ROI from './ROI.js'

export default class ROIs extends ItemList {
  constructor(corpus, idKey, defaultPostData = undefined) {
    idKey = idKey || 'sign_char_roi_id'
    const listType = 'rois'
    // TODO: we will have to calculate these relationships to some extent.
    const connectedLists = [
      corpus.combinations,
      corpus.artefacts,
      corpus.cols,
      corpus.lines,
      corpus.signchars,
    ]
    const relativeToScrollVersion = true
    defaultPostData = defaultPostData ? defaultPostData : { transaction: 'requestRoiOfCol' }
    super(corpus, idKey, listType, connectedLists, relativeToScrollVersion, defaultPostData)
  }

  formatRecord(record) {
    return {
      sign_char_roi_id: ~~record.sign_char_roi_id, // Ensure positive integer with bitwise operator
      sign_char_id: ~~record.sign_char_id, // Ensure positive integer with bitwise operator
      path: record.path,
      svgInCombination: (record.path && record.transform_matrix) ? SvgPath(wktPolygonToSvg(record.path))
        .matrix(dbMatrixToSVG(record.transform_matrix))
        .round()
        .toString() : undefined,
      transform_matrix: record.transform_matrix,
    }
  }
}
