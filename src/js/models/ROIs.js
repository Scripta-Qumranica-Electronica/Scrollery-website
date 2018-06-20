import ItemList from './ItemList.js'
import ROI from './ROI.js'

export default class ROIs extends ItemList {
  constructor(corpus, idKey, defaultPostData = undefined) {
    idKey = idKey || 'sign_char_roi_id'
    const listType = 'rois'
    const connectedLists = [corpus.combinations, corpus.artefacts, corpus.cols]
    const relativeToScrollVersion = true
    defaultPostData = defaultPostData ? defaultPostData : { transaction: 'getRoiOfCol' }
    super(corpus, idKey, ROI, listType, connectedLists, relativeToScrollVersion, defaultPostData)
  }
}
