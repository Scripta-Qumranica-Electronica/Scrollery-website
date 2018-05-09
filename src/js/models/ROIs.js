import MapList from './MapList.js'
import ROI from './ROI.js'
import axios from 'axios'
import { wktPolygonToSvg, dbMatrixToSVG } from '~/utils/VectorFactory.js'

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
}
