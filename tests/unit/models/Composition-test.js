import Composition from '~/models/Composition.js'
import Column from '~/models/Column.js'
import Line from '~/models/Line.js'

describe('CompositionModel', () => {
  let text
  beforeEach(() => {
    text = new Composition()
  })

  describe('inserting lines', () => {
    it('should ensure there is a valid column to insert at', () => {
      expect(() => {
        text.insertLine(0, 1, new Line({ id: 1, name: 'test' }))
      }).to.throw(Error)
    })

    it('should proxy to the column object', () => {
      const col = new Column({ id: 1, name: 'test' })
      const line = new Line({ id: 1, name: 'test' })
      const spy = sinon.spy(col, 'insert')

      text.push(col)
      text.insertLine(0, 1, line)

      expect(spy.calledWith(line, 1)).to.equal(true)
    })
  })
})
