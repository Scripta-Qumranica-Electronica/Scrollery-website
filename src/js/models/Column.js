import Sign from './Sign.js'
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

  static getModel() {
    return Line
  }

  /**
   * @public
   * @instance
   * 
   * @param {object|Sign} sign sign to insert
   */
  insertSign(sign) {
    if (!(sign instanceof Sign)) {
      sign = new Sign(sign)
    }

    let line = this.find(line => (line.id === sign.line_id))

    // Lazy create the line model from the sign.
    if (!line) {
      line = new Line({
        id: sign.line_id,
        name: sign.line_name,
        col_id: this.id,
        col_name: this.name
      })
      this.insert(line)
    }
    line.insert(sign)
  }

  /**
   * @public
   * @instance
   * 
   * @param {number|Line} line        A line instance, or index for that line.
   * @param {number}      splitIndex  The location to split the line at
   * 
   * @return {Line}       The new line model
   */
  splitLine(line, splitIndex = -1) {
    let index = (line instanceof Line) ? this.findIndex(line.getID()) : line

    // safeguard to ensure we have a line
    // and a place to split that line
    if (index === -1 || splitIndex === -1) {
      return
    }

    // split the line into a new line
    let target = this.get(index).sliceInto(splitIndex, line.length)
    
    // finally, insert the new line just after the previous one
    this.insert(target, index + 1)

    return target
  }

  /**
   * @public
   * @instance
   * 
   * @returns {string} a DOM string representing this column
   */
  toDOMString() {
    let str = ''
    this.forEach(line => {
      str += line.toDOMString()
    })
    return str
  }

}

export default Column