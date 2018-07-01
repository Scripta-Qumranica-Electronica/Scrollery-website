export default class Col {
  constructor(record = {}) {
    this.name = record.name
    this.col_id = ~~record.col_id
    this.scroll_version_id = ~~record.scroll_version_id
    this.rois = record.rois || []
  }
}
