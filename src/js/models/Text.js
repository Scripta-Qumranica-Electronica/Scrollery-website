import List from './List.js'
import Column from './Column.js'

/**
 * A text is an abstract concept that does not fit neatly into any single scroll or artefact
 * 
 * A text is comprised of a number of columns.
 * 
 * The hierarchy looks like so:
 *   Text
 *     > Column
 *       > Line
 *         > Sign 
 * 
 * @class
 */
class Text extends List {

  /**
   * @public
   * @static
   */
  static getModel() {
    return Column
  }

  /**
   * @public
   * @static
   * 
   * @param {array.<object>} signs an array of plain objects (derived from DB rows) that can be 
   *                               transformed into a text with columns and lines
   * @return {Text} an Text instance, created from the stream of signs
   */
  static fromSigns(signs = []) {
    const text = new Text()


    return text
  }

  /**
   * @public
   * @instance
   * 
   * @param {number} colIndex    the column index
   * @param {number} lineIndex   the index to insert the line at
   * @param {Line}   line        the line to insert
   */
  insertLine(colIndex, lineIndex, line) {
    if (!this._items[colIndex]) {
      throw new Error('Cannot insert line in column that does not exist')
    }
    return this._items[colIndex].insert(line, lineIndex)
  }
  
}

export default Text