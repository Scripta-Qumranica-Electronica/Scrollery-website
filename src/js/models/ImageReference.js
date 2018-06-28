export default class ImageReference {
  constructor(record = {}) {
    this.institution = record.institution
    this.lvl1 = record.lvl1
    this.lvl2 = record.lvl2
    this.side = record.side
    this.image_catalog_id = record.image_catalog_id
    this.scroll_version_id = record.scroll_version_id
    this.master_sqe_image_id = record.master_sqe_image_id || undefined
    this.images = record.images || []
    this.artefacts = record.artefacts || []
    this.rois = record.rois || []
  }
}
