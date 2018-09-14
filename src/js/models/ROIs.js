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
    defaultPostData = defaultPostData ? defaultPostData : { transaction: 'getRoiOfCol' }
    super(corpus, idKey, listType, connectedLists, relativeToScrollVersion, defaultPostData)
  }

  formatRecord(record) {
    return {
      sign_char_roi_id: ~~record.sign_char_roi_id,
      sign_char_id: ~~record.sign_char_id,
      path: record.path,
      svgInCombination: SvgPath(wktPolygonToSvg(record.path))
        .matrix(dbMatrixToSVG(record.transform_matrix))
        .round()
        .toString(),
      transform_matrix: record.transform_matrix,
    }
  }
}
