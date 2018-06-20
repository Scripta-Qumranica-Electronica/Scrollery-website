export default class Image {
  constructor(record = {}) {
    this.sqe_image_id = record.sqe_image_id
    this.url = record.url
    this.filename = record.filename
    this.width = record.width
    this.height = record.height
    this.dpi = record.dpi
    this.type = record.type
    this.start = record.start
    this.end = record.end
    this.is_master = record.is_master
    this.suffix = record.suffix
    this.editionSide = record.editionSide
  }

  /**
   * @return {string} the address of the image file
   */
  getAddress() {
    return `${this.url}${this.filename}/`
  }
}
