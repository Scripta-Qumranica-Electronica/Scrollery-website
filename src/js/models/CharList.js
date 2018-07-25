import Char from './Char.js'
import List from './List.js'

class CharList extends List {
  static getModel() {
    return Char
  }
}

export default CharList
