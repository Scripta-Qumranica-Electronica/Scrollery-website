export default class Col {
  constructor(record = {}) {
    this.col_id = record.col_id
    this.name = record.name
    this.rois = record.rois || []
  }
}
