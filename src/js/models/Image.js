/**
 * 
 * An image is comprised of all data relevant to a single actual image.
 * 
 * @class
 */ 
class Image {
  constructor(url, filename, width, height, dpi, type, wavelengthStart, wavelengthEnd, isMaster, suffix, editionSide) {
    this.url = url
    this.filename = filename
    this.width = width
    this.height = height
    this.dpi = dpi
    this.type = type
    this.wavelengthStart = wavelengthStart
    this.wavelengthEnd = wavelengthEnd
    this.isMaster = isMaster
    this.suffix = suffix
    this.editionSide = editionSide
  }

  getAddress() {
    return `${this.url}${this.filename}/`
  }
}

export default Image