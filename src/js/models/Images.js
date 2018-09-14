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
  }

  formatRecord(record) {
    return {
      sqe_image_id: ~~record.sqe_image_id,
      image_catalog_id: ~~record.image_catalog_id,
      url: record.url,
      filename: record.filename,
      width: ~~record.width,
      height: ~~record.height,
      dpi: ~~record.dpi,
      type: ~~record.type,
      start: ~~record.start,
      end: ~~record.end,
      is_master: ~~record.is_master,
      suffix: record.suffix,
      editionSide: ~~record.editionSide,
      getAddress: record.url && record.filename ? `${record.url}${record.filename}/` : undefined,
    }
  }
}
