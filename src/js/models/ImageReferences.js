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

  populate(postData) {
    postData = Object.assign({}, this.defaultPostData, postData)
    if (postData.scroll_version_id === undefined) {
      postData = Object.assign({}, postData, { transaction: 'getImages' })
    }
    return super.populate(postData)
  }
}
