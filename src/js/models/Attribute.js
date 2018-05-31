import extendModel from './extendModel.js'

const defaults = {
  attribute_id: 0,
  attribute_name: '',
  values: [],
}

export default class Attribute extends extendModel(defaults) {
  constructor(attrs, isPersisted) {
    if (!Array.isArray(attrs.values)) {
      attrs.values = [attrs.values]
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
