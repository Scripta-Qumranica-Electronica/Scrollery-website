import SvgPath from 'svgpath'
import { wktPolygonToSvg, dbMatrixToSVG, } from '~/utils/VectorFactory.js'

export default class ROI {
  constructor(record = {}) {
    this.sign_char_roi_id = ~~record.sign_char_roi_id
    this.sign_char_id = ~~record.sign_char_id
    this.path = record.path
    this.svgInCombination = SvgPath(wktPolygonToSvg(record.path))
      .matrix(dbMatrixToSVG(record.transform_matrix))
      .round()
      .toString()
    this.transform_matrix = record.transform_matrix
  }
}
