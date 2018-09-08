export default class Sign {
  constructor(record = {}) {
    this.sign_id = ~~record.sign_id
    this.next_sign_ids = record.next_sign_ids
    this.sign_chars = record.sign_chars || []
  }
}
