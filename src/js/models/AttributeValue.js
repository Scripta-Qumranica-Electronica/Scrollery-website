import extendModel from './extendModel.js'

const defaults = {
  attribute_value_id: -1,
  attribute_value_description: '',
  attribute_numeric_value: -1,
  string_value: '',
  type: ''
}

export default class AttributeValue extends extendModel(defaults) {
  /**
   * @return {number} the sign id
   */
  getID() {
    return this.attribue_value_id
  }
}
