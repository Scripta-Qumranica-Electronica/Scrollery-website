import MapList from './MapList.js'
import Comp from './Comp.js'

class Corpus extends MapList {

  static getModel() {
    return Comp;
  }
}

export default Corpus