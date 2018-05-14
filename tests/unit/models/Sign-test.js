import Sign from '~/models/Sign.js'
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
        next_sign_id: 2,
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

  describe('previous sign', () => {
    let sign, prev
    beforeEach(() => {
      sign = new Sign({
        sign_id: 2,
        prev_sign_id: 1,
      })
      prev = new Sign({
        sign_id: 1,
      })
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
        sign_id: 1,
        sign: '·',
        is_reconstructed: true,
      })
    })

    it('should know its id', () => {
      expect(sign.getID()).to.equal(1)
    })

    it('should know if it is a whitespace character', () => {
      expect(sign.is_whitespace).to.equal(true)
    })

    it('should know about the varieties of whitespace', () => {
      ;[{ sign: false }, { sign: '' }, { sign: ' ' }, { sign: '&nbsp;' }, { sign: '·' }].forEach(
        attrs => {
          sign = new Sign({ sign: false })
          expect(sign.is_whitespace).to.equal(true)
        }
      )
    })

    it('should know if it is reconstructed', () => {
      expect(sign.reconstructed()).to.equal(true)
    })
  })

  describe('extending', () => {
    let sign,
      attrs = {
        sign_id: 1,
        sign: '·',
        is_reconstructed: true,
      }
    beforeEach(() => {
      sign = new Sign(attrs)
    })

    it('should expose an extend method that extends it with new attributes', () => {
      let newSign = sign.extend({
        col_id: 1,
      })
      expect(newSign instanceof Sign).to.equal(true)
      expect(newSign).to.equal(sign)
      expect(newSign.reconstructed()).to.equal(sign.reconstructed())
      expect(newSign.col_id).to.equal(1)
    })
  })

  describe('stringifying with sign.toString()', () => {
    describe('whitespace', () => {
      let sign,
        attrs = {
          sign_id: 1,
          sign: '·',
          is_reconstructed: true,
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
          sign: 'א',
          is_reconstructed: true,
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
          sign: '·',
          is_reconstructed: true,
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
          sign: 'א',
          is_reconstructed: true,
        }
      beforeEach(() => {
        sign = new Sign(attrs)
      })

      it('should return the sign without encoding', () => {
        expect(sign.toDOMString()).to.equal('א')
      })
    })
  })

  describe('attributes', () => {
    let sign,
    attributeID = 12345,
    attrs = () =>  ({
      sign_id: 1,
      sign: 'א',
      is_reconstructed: false,
      attributes: [
        new Attribute({
          attribute_id: attributeID,
          attribute_value: 'some_value',
          attribute_description: 'attribute description'
        })
      ]
    })
    beforeEach(() => {
      sign = new Sign(attrs())
    })

    it('should create a List from the raw attributes', () => {
      expect((sign.attributes instanceof AttributeList)).to.equal(true)
    })

    it('should accept a new attribute as an object', () => {
      sign.addAttribute({
        attribute_id: 12346,
        attribute_value: 'some_value',
        attribute_description: 'attribute description'
      })
      expect(sign.attributes.length).to.equal(2)
    })

    it('should accept a new attribute as an instance of Attribute', () => {
      const attribute = new Attribute({
        attribute_id: 12346,
        attribute_value: 'some_value',
        attribute_description: 'attribute description'
      })
      sign.addAttribute(attribute)
      expect(sign.attributes.length).to.equal(2)
      expect(sign.attributes.get(1)).to.equal(attribute)
    })

    it('should remove an attribute by id', () => {
      sign.removeAttribute(attributeID)
      expect(sign.attributes.length).to.equal(0)
    })
  })

})
