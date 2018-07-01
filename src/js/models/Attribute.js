import extendModel from './extendModel.js'
import AttributeValue from './AttributeValue.js'
import AttributeValueList from './AttributeValueList.js'

const defaults = {
  sign_char_attribute_id: -1,
  attribute_id: -1,
  attribute_name: '',
  name: '',
  values: new AttributeValueList(),
}

export default class Attribute extends extendModel(defaults) {
  constructor(attrs, isPersisted) {
    if (!Array.isArray(attrs.values)) {
      attrs.values = [attrs.values]
    }

    // coerce attribute values to a List
    if (attrs.values && !(attrs.values instanceof AttributeValueList)) {
      attrs.values = new AttributeValueList(
        {},
        attrs.values.map(v => new AttributeValue(v, isPersisted)),
        isPersisted
      )
    }

    super(attrs, isPersisted)
  }

  /**
   * @return {number}
   */
  getID() {
    return this.attribute_id
  }
}
