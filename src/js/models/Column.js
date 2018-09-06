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
   * Collapse line changes a set of objects
   *
   * @return {object} the changes object with additions, deletions, updates
   */
  getChanges() {
    const changes = {
      additions: {},
      deletions: {},
      updates: {},
    }

    if (this.hasChanges()) {
      this.forEach(line => {
        const { additions, deletions, updates, } = line.getChanges()
        Object.assign(changes.additions, additions || {})
        Object.assign(changes.deletions, deletions || {})
        Object.assign(changes.updates, updates || {})
      })
    }

    return changes
  }

  /**
   * Flatten the column into an flat array.
   *
   * @todo Implement an ordered, iteratable map or the like
   *
   * @return {array.<Sign>} An array of sign items
   */
  flattenToSignStream() {
    const signs = []
    signs.map = {}
    this.forEach(line => {
      line.forEach(sign => {
        signs.map[sign.getUUID()] = signs.length
        signs.push(sign)
      })
    })
    return signs
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
    const index = line instanceof Line ? this.findIndex(line.getID()) : line

    // safeguard to ensure we have a line
    // and a place to split that line
    if (index === -1 || splitIndex === -1) {
      return
    }

    // split the line into a new line
    const target = this.get(index).sliceInto(splitIndex, line.length)

    // finally, insert the new line just after the previous one
    this.insert(target, index + 1)

    return target
  }

  /**
   * Given an array of objects with line-ids and text, synchronize the column model's state
   * to that array
   *
   * @public
   * @instance
   *
   * @param {array.<object>} target  an array of the object representation of each line that takes this shape:
   *
   * {
   *   id: lineId,
   *   text: "text in the line"
   * }
   */
  synchronizeTo(target) {
    // keep track of where the iteration is on the target
    // object via this index
    let targetIndex = target.length - 1

    // iterate backwards through the list, removing elements
    // as we go. Going in reverse order allows us to remove things
    // but keep indexes the same.
    for (let i = this.length - 1; i > -1; i--) {
      const line = this.get(i)
      const t = target[targetIndex]
      const tId = parseInt(t.id)

      // there is no corresponding target element or the target id doesn't match,
      // remove the line
      if (!t || tId !== line.getID()) {
        this.delete(i)

        // otherwise, we expect that the line will match. In this cas
      } else if (tId === line.getID()) {
        line.synchronizeTo(t.text)
        targetIndex--
      }
    }

    // if there are remaining items in the target list
    // at the beginning, add those in.
    while (targetIndex > -1) {
      const line = new Line({})
      line.synchronizeTo(target[targetIndex].text)
      this.insert(line, 0)
      targetIndex--
    }
  }

  /**
   * @public
   * @instance
   *
   * @returns {string} a string representation of the column. Lines are separate with a \n
   */
  toString() {
    let str = ''
    this.forEach(line => {
      str += `${str.length ? '\n' : ''}${line.toString()}`
    })
    return str
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
