import SvgPath from 'svgpath'
import { wktPolygonToSvg, wktParseRect, dbMatrixToSVG } from '~/utils/VectorFactory.js'

export default class Artefact {
  constructor(record = {}) {
    this.artefact_position_id = ~~record.artefact_position_id
    this.artefact_id = ~~record.artefact_id
    this.artefact_shape_id = ~~record.artefact_shape_id
    this.scroll_version_id = ~~record.scroll_version_id
    this.name = record.name
    this.side = ~~record.side
    this.mask = record.mask
    this.svgInCombination =
      record.mask &&
      record.rect &&
      record.transform_matrix &&
      SvgPath(wktPolygonToSvg(record.mask, wktParseRect(record.rect)))
        .matrix(dbMatrixToSVG(record.transform_matrix))
        .round()
        .toString()
    this.transform_matrix = record.transform_matrix
    this.rect = record.rect
    this.image_catalog_id = ~~record.image_catalog_id
    this.id_of_sqe_image = ~~record.id_of_sqe_image
    this.catalog_side = ~~record.catalog_side
    this.rois = record.rois || []
  }
}
