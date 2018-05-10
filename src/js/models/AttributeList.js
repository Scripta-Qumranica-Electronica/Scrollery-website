import Attribute from './Attribute.js'
import List from './List.js'

class AttributeList extends List {
  static getModel() {
    return Attribute
  }
}

export default AttributeList
