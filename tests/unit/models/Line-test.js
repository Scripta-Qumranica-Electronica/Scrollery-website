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

      // under the hood, it creates a new instance with the modification
      expect(line.get(0)).not.to.equal(sign)

      // and copies in the line.id value
      expect(line.get(0).line_id).to.equal(line.id)
    })
  })
})
