import diff from '~/utils/StringDiff.js'
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
    return Sign
  }

  /**
   * Diff the line-model against the provided string (usually from the DOM representation
   * of this line). Therefore, inserts/deletes to the data will be to bring it into
   * alignment with the given string
   *
   * @public
   * @instance
   *
   * @param {string} str a string to synchronize this line to
   */
  synchronizeTo(str) {
    // TODO: handle whitespace chars more consistently.

    // Note: for the purpose of synchronization algorithm, it is important that the
    //       the whitespace char be a single char (rather than &nbsp; or something)
    const diffs = diff(this.toString().replace(/\s/g, ' '), str.replace(/\s/g, ' '))

    let diffIndex = 0
    for (let i = 0, n = diffs.length; i < n; i++) {
      // each diff in the array takes this shape:
      // [code = 0, 1, -1, change = 'string difference']
      const d = diffs[i]
      switch (d[0]) {
      // no change, simply increment up our string index
      case diff.EQUAL:
        diffIndex = diffIndex + d[1].length
        break

        // there's been (a) sign(s) inserted
      case diff.INSERT:
        d[1].split('').forEach(char => {
          this.insert(
            new Sign({
              chars: [
                {
                  sign_char: char
                }
              ]
            }),
            diffIndex
          )
          diffIndex++
        })
        break

        // there's been a sign deleted
      case diff.DELETE:
        d[1].split('').forEach(() => this.delete(diffIndex))
        break
      }
    }
  }

  toDOMString() {
    let str = ''
    this.forEach(sign => {
      let classes = ''
      const attrs = sign.attributes()
      attrs.forEach(attribute => {
        const name = attribute.attribute_name === '' ? '' : attribute.attribute_name + '_'
        attribute.values.forEach(value => {
          classes += value.attribute_value === '' ? '' : name + value.attribute_value + ' '
        })
      })
      classes += classes.indexOf('is_reconstructed_TRUE') === -1 ? 'is_reconstructed_FALSE' : ''
      str += `<span class="${classes}">${sign.toDOMString()}</span>`
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
}

export default Line
