
import Sign from '~/models/Sign.js'

describe('Sign', () => {
  it('should be constructible', () => {
    let sign = new Sign({
      id: "test"
    }, null)
    expect(sign instanceof Sign).to.equal(true)
  })

  it('should preserve a reference to the map', () => {
    let map = {}
    let sign = new Sign({
      id: "test"
    }, map)
    expect(sign.map).to.equal(map)
  })

  describe('next sign', () => {

    let sign, map, next
    beforeEach(() => {
      map = new Map()

      sign = new Sign({
        id: 1,
        next_sign: 2
      }, map)
      next = new Sign({
        id: 2
      }, map)

      map.set(sign.id, sign)
      map.set(next.id, next)
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

    it('should retrieve the next sign', () => {
      expect(sign.next()).to.equal(next)
    })

  })

  describe('previous sign', () => {

    let sign, map, prev
    beforeEach(() => {
      map = new Map()

      sign = new Sign({
        id: 2,
        prev_sign: 1
      }, map)
      prev = new Sign({
        id: 1
      }, map)

      map.set(sign.id, sign)
      map.set(prev.id, prev)
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

    it('should retrieve the previous sign', () => {
      expect(sign.previous()).to.equal(prev)
    })

  })

  describe('attributes', () => {
    let sign, map
    beforeEach(() => {
      map = new Map()
      sign = new Sign({
        id: 1,
        sign: '·',
        is_reconstructed: true
      }, map)
      map.set(sign.id, sign)
    })

    it('should know if it is a whitespace character', () => {
      expect(sign.isWhitespace()).to.equal(true)
    })

    it('should know if it is reconstructed', () => {
      expect(sign.reconstructed()).to.equal(true)
    })
  })
})