import ItemList from './ItemList.js'
// import Image from './Image.js'

export default class Images extends ItemList {
  constructor(corpus, idKey, defaultPostData = undefined) {
    idKey = idKey || 'sqe_image_id'
    const listType = 'images'
    const connectedLists = [corpus.imageReferences]
    const relativeToScrollVersion = false
    defaultPostData = defaultPostData ? defaultPostData : { transaction: 'imagesOfInstFragments' }
    super(corpus, idKey, listType, connectedLists, relativeToScrollVersion, defaultPostData)

    // Setup socket.io listeners
    this.socket.on('receiveImagesOfInstFragments', msg => {
      this.corpus.response(this.processPopulate(msg))
    })
  }

  formatRecord(record) {
    return {
      sqe_image_id: ~~record.sqe_image_id, // Ensure positive integer with bitwise operator
      image_catalog_id: ~~record.image_catalog_id, // Ensure positive integer with bitwise operator
      url: record.url,
      filename: record.filename,
      width: ~~record.width, // Ensure positive integer with bitwise operator
      height: ~~record.height, // Ensure positive integer with bitwise operator
      dpi: ~~record.dpi, // Ensure positive integer with bitwise operator
      type: ~~record.type, // Ensure positive integer with bitwise operator
      start: ~~record.start, // Ensure positive integer with bitwise operator
      end: ~~record.end, // Ensure positive integer with bitwise operator
      is_master: ~~record.is_master, // Ensure positive integer with bitwise operator
      suffix: record.suffix,
      editionSide: ~~record.editionSide, // Ensure positive integer with bitwise operator
      getAddress: record.url && record.filename ? `${record.url}${record.filename}/` : undefined,
    }
  }
}
