import { Record } from 'immutable'

class Model extends Record({id: 0}) {

  /**
   * @returns {number} the record ID
   */
  getID() {
    return this.id
  }

}

export default Model