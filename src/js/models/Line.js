export default class Line {
  constructor(record = {}) {
    this.name = record.name
    this.line_id = ~~record.line_id
    this.scroll_version_id = ~~record.scroll_version_id
    this.line_sign_id = ~~record.line_sign_id
    this.signs = record.signs || []
    this.rois = record.rois || []
  }
}
