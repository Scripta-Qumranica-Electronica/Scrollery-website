import ItemList from './ItemList.js'
// import ImageReference from './ImageReference.js'

export default class ImageReferences extends ItemList {
  constructor(corpus, idKey, defaultPostData = undefined) {
    idKey = idKey || 'image_catalog_id'
    const listType = 'imageReferences'
    const connectedLists = [corpus.combinations,]
    const relativeToScrollVersion = false
    defaultPostData = defaultPostData ? defaultPostData : { transaction: 'requestImgOfComb' }
    super(
      corpus,
      idKey,
      // ImageReference,
      listType,
      connectedLists,
      relativeToScrollVersion,
      defaultPostData
    )

    // Setup socket.io listeners
    this.socket.on('receiveImgOfComb', msg => {
      this.corpus.response(this.processPopulate(msg))
    })
  }

  formatRecord(record) {
    return {
      institution: record.institution,
      lvl1: record.lvl1,
      lvl2: record.lvl2,
      side: ~~record.side, // Ensure positive integer with bitwise operator
      image_catalog_id: ~~record.image_catalog_id, // Ensure positive integer with bitwise operator
      scroll_version_id: ~~record.scroll_version_id, // Ensure positive integer with bitwise operator
      master_sqe_image_id: ~~record.master_sqe_image_id || undefined, // Ensure positive integer with bitwise operator
      images: record.images || [],
      artefacts: record.artefacts || [],
      rois: record.rois || [],
    }
  }

  // TODO remove this function
  populate(postData) {
    postData = Object.assign({}, this.defaultPostData, postData)
    if (postData.scroll_version_id === undefined) {
      postData = Object.assign({}, postData, { transaction: 'getImages', })
    }
    return super.populate(postData)
  }

  getMasterImage(imageReferenceID) {
    let masterImage = undefined
    for (let i = 0, image; (image = this.get(imageReferenceID).images[i]); i++) {
      if (this.corpus.images.get(image).is_master === 1) masterImage = this.corpus.images.get(image)
    }
    return masterImage
  }
}
