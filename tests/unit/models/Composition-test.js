import Composition from '~/models/Composition.js'
import Column from '~/models/Column.js'
import Line from '~/models/Line.js'

describe('CompositionModel', () => {
  let text
  beforeEach(() => {
    text = new Composition()
  })

  it('should create a text from a stream', () => {
    expect(Composition.fromSigns([]) instanceof Composition).to.equal(true)
  })

  describe('adding columns', () => {
    it('should push a column', () => {
      text.push(new Column({ id: 1, name: 'test' }))
      text.push(new Column({ id: 1, name: 'test' }))
      expect(text.count()).to.equal(2)
    })

    it('should validate the type on insert', () => {
      expect(() => {
        text.push({})
      }).to.throw(TypeError)

      expect(() => {
        text.insert({}, 1)
      }).to.throw(TypeError)
    })

    it('should insert a column at a specified inded', () => {
      const col = new Column({ id: 1, name: 'test' })
      text.push(new Column({ id: 1, name: 'test' }))
      text.push(new Column({ id: 1, name: 'test' }))
      text.insert(col, 1)
      expect(text.get(1)).to.equal(col)
    })

    it('should insert a column at the end if no specified inded', () => {
      const col = new Column({ id: 1, name: 'test' })
      text.push(new Column({ id: 1, name: 'test' }))
      text.push(new Column({ id: 1, name: 'test' }))
      text.insert(col)
      expect(text.get(2)).to.equal(col)
    })
  })

  describe('removing columns', () => {
    it('should delete columns at a specified index', () => {
      text.push(new Column({ id: 1, name: 'test' }))
      text.push(new Column({ id: 1, name: 'test' }))
      text.delete(0)
      expect(text.count()).to.equal(1)
    })
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
