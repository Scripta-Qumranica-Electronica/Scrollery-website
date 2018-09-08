export default class Col {
  constructor(record = {}) {
    this.name = record.name
    this.col_id = ~~record.col_id
    this.scroll_version_id = ~~record.scroll_version_id
    this.lines = record.lines || []
    this.rois = record.rois || []
    this.col_sign_id = ~~record.col_sign_id
    this.signs = record.signs || []
  }
}
