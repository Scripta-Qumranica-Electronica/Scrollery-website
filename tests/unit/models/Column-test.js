import { stringToElement } from '@test'

import Sign from '~/models/Sign.js'
import Line from '~/models/Line.js'
import Column from '~/models/Column.js'

import { factory } from '@test'

// todo: move into src dir
let createTargetFromNodeList = nodes => {
  let target = []
  for (let i = 0, n = nodes.length; i < n; i++) {
    let child = nodes[i]
    target.push({
      id: child.dataset.lineId,
      text: child.innerText,
    })
  }
  return target
}

describe('ColumnModel', () => {
  it('should use Line as its model', () => {
    expect(Column.getModel()).to.equal(Line)
  })

  describe('instantiated without lines', () => {
    let col
    beforeEach(() => {
      col = factory.column({ signs: 30 })
    })

    it('should insert lines on the fly for inserted signs', () => {
      expect(col.toString().replace(/[\s\n]+/g, '').length).to.equal(30)
    })

    it('should create an equal number of P tags as lines', () => {
      let lines = stringToElement(col.toDOMString())

      expect(lines.childNodes.length).to.equal(col.length)
    })
  })

  describe('DOM synchronization', () => {
    let short, long
    beforeEach(() => {
      short = factory.column({ signs: 20 })
      long = factory.column({ signs: 25 })
    })

    it('should synchronize given an array of {id: lineID, text: "line text"} when the target is longer', () => {
      let lines = stringToElement(long.toDOMString()),
        target = createTargetFromNodeList(lines.childNodes)
      short.synchronizeTo(target)

      expect(short.toString()).to.equal(long.toString())
    })

    it('should synchronize given an array of {id: lineID, text: "line text"} when the target is shorter', () => {
      let lines = stringToElement(short.toDOMString()),
        target = createTargetFromNodeList(lines.childNodes)

      long.synchronizeTo(target)

      expect(short.toString()).to.equal(long.toString())
    })
  })

  describe('splitLine(line = Line|lineIndex, splitIndex = indexToSplitLine)', () => {
    let col, line
    beforeEach(() => {
      col = factory.column({ signs: 30 })
      line = col.get(0)
    })

    it('should safeguard receiving no valid line or splitIndex', () => {
      expect(col.splitLine(-1)).to.equal(undefined)
    })

    it('should create a new line instance to split the line into', () => {
      let newLine = col.splitLine(line, 5)
      expect(line).not.to.equal(newLine)
    })

    it('should place the new line directly after the previous line', () => {
      let newLine = col.splitLine(line, 5)
      expect(newLine).to.equal(col.get(1))
    })

    it('should put everything after the index into the new line', () => {
      let oldStr = line.toString()
      let newLine = col.splitLine(line, 5)

      // check lengths
      expect(line.length).to.equal(5)
      expect(newLine.length).to.equal(oldStr.length - 5)

      // check string values
      expect(line.toString()).to.equal(oldStr.slice(0, 5))
      expect(newLine.toString()).to.equal(oldStr.slice(5))
    })
  })

  describe('flattenToSignStream', () => {
    let col, flat
    beforeEach(() => {
      col = factory.column({ signs: 30 })
      flat = col.flattenToSignStream()
    })

    it('should flatten the column tree to a single array', () => {
      expect(Array.isArray(flat)).to.equal(true)
    })

    it('should create a map that contains keys pointing to each item', () => {
      expect(Object.keys(flat.map).length).to.equal(flat.length)
    })
  })

  describe('getChanges', () => {
    let col, flat
    beforeEach(() => {
      col = factory.column({ signs: 30 })
      flat = col.flattenToSignStream()
    })

    it('should return changes as an object with signs (rather than lines', () => {
      let sign = flat[0]

      // use the flat array to modify the signs directly
      sign.sign = 'a'

      expect(col.getChanges().updates[sign.getUUID()]).to.equal(sign)
    })
  })
})
