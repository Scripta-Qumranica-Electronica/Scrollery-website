export default class Col {
  constructor(record = {}) {
    this.name = record.name
    this.col_id = record.col_id
    this.rois = []
  }
}
