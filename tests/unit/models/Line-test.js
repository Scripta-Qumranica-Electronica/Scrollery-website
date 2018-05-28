import Line from '~/models/Line.js'
import Sign from '~/models/Sign.js'

describe('LineModel', () => {
  let line,
    attributes = {
      id: 1,
      name: 'test',
    }
  beforeEach(() => {
    line = new Line(attributes)
  })

  describe('inserting signs', () => {
    let sign
    beforeEach(() => {
      sign = new Sign({
        line_id: 2,
      })
    })

    it('should insert signs with the line attributes attached', () => {
      line.push(sign)

      // under the hood, it modifies the sign instance with new attributes
      expect(line.get(0)).to.equal(sign)

      // and copies in the line.id value
      expect(line.get(0).line_id).to.equal(line.id)
    })

    it('should throw when receiving non-signs', () => {
      expect(() => line.insert({sign: false}, 1)).to.throw(TypeError)
      expect(() => line.push({sign: false})).to.throw(TypeError)
    })
  })
})
