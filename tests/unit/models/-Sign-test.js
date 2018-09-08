import Sign from '~/models/-Sign.js'
import Attribute from '~/models/Attribute.js'
import AttributeList from '~/models/AttributeList.js'

describe('Sign', () => {
  it('should be constructible', () => {
    let sign = new Sign({
      sign_id: 'test',
    })
    expect(sign instanceof Sign).to.equal(true)
  })

  describe('next sign', () => {
    let sign, next
    beforeEach(() => {
      sign = new Sign({
        sign_id: 1,
        next_sign_ids: [2],
      })
      next = new Sign({
        sign_id: 2,
      })
    })

    it('should know if it has a next sign', () => {
      expect(sign.hasNext()).to.equal(true)
      expect(next.hasNext()).to.equal(false)
    })
  })

  describe('attributes', () => {
    let sign
    beforeEach(() => {
      sign = new Sign({
        sign_id: 1,
        chars: {
          sign_char: '·',
        },
      })
    })

    it('should know its id', () => {
      expect(sign.getID()).to.equal(1)
    })

    it('should know if it is a whitespace character', () => {
      expect(sign.isWhitespace()).to.equal(true)
    })

    it('should know about the varieties of whitespace', () => {
      ;[false, '', ' ', '&nbsp;', '·'].forEach(signChar => {
        sign = new Sign({
          chars: [{ sign_char: signChar }],
        })
        expect(sign.getMainChar().is_whitespace).to.equal(true)
      })
    })
  })

  describe('stringifying with sign.toString()', () => {
    describe('whitespace', () => {
      let sign,
        attrs = {
          sign_id: 1,
          chars: [
            {
              sign_char: '·',
            },
          ],
        }
      beforeEach(() => {
        sign = new Sign(attrs)
      })

      it('should return an empty string for the toString', () => {
        expect(/^\s$/.test(sign.toString())).to.equal(true)
      })
    })

    describe('non-whitespace', () => {
      let sign,
        attrs = {
          sign_id: 1,
          chars: [
            {
              sign_char: 'א',
            },
          ],
        }
      beforeEach(() => {
        sign = new Sign(attrs)
      })

      it('should return an empty string for the toString', () => {
        expect(sign.toString()).to.equal('א')
      })
    })
  })

  describe('stringifying with sign.toDOMString()', () => {
    describe('whitespace', () => {
      let sign,
        attrs = {
          sign_id: 1,
          chars: [
            {
              sign_char: '·',
            },
          ],
        }
      beforeEach(() => {
        sign = new Sign(attrs)
      })

      it('should return an HTML encoded non-breaking space', () => {
        expect(sign.toDOMString()).to.equal('&nbsp;')
      })
    })

    describe('non-whitespace', () => {
      let sign,
        attrs = {
          sign_id: 1,
          chars: [
            {
              sign_char: 'א',
            },
          ],
        }
      beforeEach(() => {
        sign = new Sign(attrs)
      })

      it('should return the sign without encoding', () => {
        expect(sign.toDOMString()).to.equal('א')
      })
    })
  })
})
