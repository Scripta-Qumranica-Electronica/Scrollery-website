import ItemList from './ItemList.js'
import ImageReference from './ImageReference.js'

export default class ImageReferences extends ItemList {
  constructor(corpus, idKey, defaultPostData = undefined) {
    idKey = idKey || 'image_catalog_id'
    const listType = 'imageReferences'
    const connectedLists = [corpus.combinations]
    const relativeToScrollVersion = false
    defaultPostData = defaultPostData ? defaultPostData : { transaction: 'getImgOfComb' }
    super(
      corpus,
      idKey,
      ImageReference,
      listType,
      connectedLists,
      relativeToScrollVersion,
      defaultPostData
    )
  }
}
