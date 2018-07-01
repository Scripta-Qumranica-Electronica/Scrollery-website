import AttributeValue from './AttributeValue.js'
import List from './List.js'

class AttributeList extends List {
  static getModel() {
    return AttributeValue
  }
}

export default AttributeList
