export default class SignCharCommentary {
  constructor(record = {}) {
    this.sign_char_commentary_id = ~~record.sign_char_commentary_id
    this.sign_char_id = ~~record.sign_char_id
    this.attribute_id = ~~record.attribute_id
    this.scroll_version_id = ~~record.scroll_version_id
    this.commentary = record.commentary
  }
}
