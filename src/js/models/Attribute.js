import Record from './Record.js'

const defaults = {
  attribute_id: 0,
  attribute: '',
  attribute_value: '',
  attribute_description: '',
}

export default class Attribute extends Record(defaults) {
  /**
   * @return {number}
   */
  getID() {
    return this.attribute_id
  }
}
