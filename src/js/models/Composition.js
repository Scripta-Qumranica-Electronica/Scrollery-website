import List from './List.js'
import Column from './Column.js'

/**
 * A composition is an abstract concept that does not fit neatly into any single scroll or artefact
 *
 * A composition is comprised of a number of columns.
 *
 * The hierarchy looks like so:
 *   Composition
 *     > Column
 *       > Line
 *         > Sign
 *
 * @class
 */
class Composition extends List {
  /**
   * @public
   * @static
   */
  static getModel() {
    return Column
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

export default Composition
