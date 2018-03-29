
import Sign from '~/models/Sign.js'

describe('Sign', () => {
  it('should be constructible', () => {
    let sign = new Sign({
      id: "test"
    })
    expect(sign instanceof Sign).to.equal(true)
  })

  describe('next sign', () => {

    let sign, next
    beforeEach(() => {
      sign = new Sign({
        id: 1,
        next_sign: 2
      })
      next = new Sign({
        id: 2
      })
    })

    it('should throw an error when attempting to overwrite next sign', () => {
      expect(() => {
        sign.next_sign = null
      }).to.throw()
    })

    it('should know if it has a next sign', () => {
      expect(sign.hasNext()).to.equal(true)
      expect(next.hasNext()).to.equal(false)
    })

  })

  describe('previous sign', () => {

    let sign, prev
    beforeEach(() => {
      sign = new Sign({
        id: 2,
        prev_sign: 1
      })
      prev = new Sign({
        id: 1
      })
    })

    it('should throw an error when attempting to overwrite previous sign', () => {
      expect(() => {
        sign.prev_sign = null
      }).to.throw()
    })

    it('should know if it has a previous sign', () => {
      expect(sign.hasPrevious()).to.equal(true)
      expect(prev.hasPrevious()).to.equal(false)
    })

  })

  describe('attributes', () => {
    let sign
    beforeEach(() => {
      sign = new Sign({
        id: 1,
        sign: '·',
        is_reconstructed: true
      })
    })

    it('should know if it is a whitespace character', () => {
      expect(sign.isWhitespace()).to.equal(true)
    })

    it('should know if it is reconstructed', () => {
      expect(sign.reconstructed()).to.equal(true)
    })
  })

  describe('extending', () => {

    let sign, attrs = {
      id: 1,
      sign: '·',
      is_reconstructed: true
    }
    beforeEach(() => {
      sign = new Sign(attrs)
    })

    it('should expose an extend method that returns a new sign with the extended attributes', () => {
      let newSign = sign.extend({
        col_id: 1
      })
      expect(newSign instanceof Sign).to.equal(true)
      expect(newSign).not.to.equal(sign)
      expect(newSign.reconstructed()).to.equal(sign.reconstructed())
      expect(newSign.col_id).to.equal(1)
    })

  })
})