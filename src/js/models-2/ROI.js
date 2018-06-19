export default class ROI {
  constructor(record = {}) {
    this.sign_char_roi_id = record.sign_char_roi_id
    this.sign_char_id = record.sign_char_id
    this.path = record.path
    this.svgInCombination = record.svgInCombination
    this.transform_matrix = record.transform_matrix
  }
}
