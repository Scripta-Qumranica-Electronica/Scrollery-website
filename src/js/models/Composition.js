import List from './List.js'
import Column from './Column.js'

import sort from '~/utils/SortSigns.js'

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
   * 
   * @param {object}      attrs 
   * @param {array.object} signs  an array of raw, but sorted sign objects
   */
  constructor(attrs, signs = []) {
    super(attrs)

    const cols = {}
    for (let i = 0, n = signs.length; i < n; i ++) {
      let sign = signs[i]
      let col = cols[sign.col_id]
      if (!col) {
        col = cols[sign.col_id] = new Column({
          id: sign.col_id,
          name: sign.col_name
        })
        this.insert(col);
      }

      col.insertSign(sign)
    }
  }

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
   * @param {object}         attrs attributes of the text
   * @param {array.<object>} signs an array of plain objects (derived from DB rows) that can be 
   *                               transformed into a text with columns and lines
   * @return {Text} an Text instance, created from the stream of signs
   */
  static fromSigns(attrs = {}, signs = []) {
    return new Composition(attrs, sort(signs))
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