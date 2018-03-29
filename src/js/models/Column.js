import List from './List.js'
import Line from './Line.js'

/**
 * A column is the building block of a text.
 * 
 * A column is comprised of a number of lines.
 * 
 * @class
 */
class Column extends List {

  /**
   * @param {object}          attributes the column attributes
   * @param {array.<Line>=[]} [lines]    an array of lines
   */
  constructor(attributes, lines = []) {
    super(attributes, lines)
  }

  static getModel() {
    return Line
  }
}

export default Column