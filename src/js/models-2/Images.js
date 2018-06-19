import ItemList from './ItemList.js'
import Image from './Image.js'

export default class Images extends ItemList {
  constructor(corpus, idKey, defaultPostData = undefined) {
    idKey = idKey || 'sqe_image_id'
    const listType = 'images'
    const connectedLists = [corpus.imageReferences]
    const relativeToScrollVersion = false
    defaultPostData = defaultPostData ? defaultPostData : { transaction: 'imagesOfInstFragments' }
    super(corpus, idKey, Image, listType, connectedLists, relativeToScrollVersion, defaultPostData)
  }
}
