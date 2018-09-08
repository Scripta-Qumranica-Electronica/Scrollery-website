export default class SignChar {
  constructor(record = {}) {
    this.sign_char_id = ~~record.sign_char_id
    this.is_variant = record.is_variant || 0
    this.char = record.char
    this.sign_char_attributes = record.sign_char_attributes || []
    this.rois = record.rois || []
  }
}
