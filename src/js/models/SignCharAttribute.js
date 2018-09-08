export default class SignCharAttribute {
  constructor(record = {}) {
    this.sign_char_attribute_id = ~~record.sign_char_attribute_id
    this.scroll_version_id = ~~record.scroll_version_id
    this.sequence = ~~record.sequence || 0
    this.attribute_name = record.attribute_name
    this.attribute_values = Array.isArray(record.attribute_values)
      ? record.attribute_values
      : [record.attribute_values]
    this.commentary_id = ~~record.commentary_id || 0
  }
}
