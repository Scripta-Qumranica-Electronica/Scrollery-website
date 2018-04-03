import List from './List.js'
import Sign from './Sign.js'

/**
 * A line is a building block in a division
 * 
 * A line is comprised of signs
 * 
 * @class
 */
class Line extends List {

  static getModel() {
    return Sign;
  }

  /**
   * @public
   * @instance
   * 
   * @param {Sign}      sign    A sign to insert
   * @param {number=-1} index   The index at which to insert the column, defaults to the end
   */
  insert(sign, index = -1) {
    if (!(sign instanceof Sign)) {
      throw new TypeError('Line.prototype.insertSign(sign, index) expect a sign of type Sign')
    }

    index === -1
      ? this.push(sign)
      : super.insert(this._setAttributes(sign), index)
  }

  /**
   * @public
   * @instance
   * 
   * @param {Sign} sign A sign to insert
   */
  push(sign) {
    if (!(sign instanceof Sign)) {
      throw new TypeError('Line.prototype.pushSign(sign) expect a sign of type Sign')
    }

    super.push(this._setAttributes(sign))
  }

  toDOMString() {
    let str = ''
    this.forEach(sign => {
      str += sign.toDOMString()
    }, this)

    return `<p data-line-id="${this.getID()}">${str}</p>`
  }

  /**
   * @returns {string} a plain string with all signs
   */
  toString() {
    let str = ''
    this.forEach(sign => {
      str += sign.toString()
    }, this)
    return str
  }

  /**
   * @private
   * @instance
   * 
   * @param {Sign} sign A sign to insert
   */
  _setAttributes(sign) {
    return sign.extend({
      line_name: this.name,
      line_id: this.id,
      col_name: this.col_name,
      col_id: this.col_id
    })
  }
}

export default Line