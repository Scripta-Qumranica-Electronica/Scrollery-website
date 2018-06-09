import Char from '~/models/Char.js'
import Attribute from '~/models/Attribute.js'
import AttributeList from '~/models/AttributeList.js'

const mockData = {
  "sign_char_id": 998006,
  "sign_char": "",
  "attributes": [
    {
      "attribute_id": 1,
      "attribute_name": "sign_type",
      "values": {
        "attribute_value_id": 9,
        "attribute_value": "BREAK"
      }
    },
    {
      "attribute_id": 2,
      "attribute_name": "break_type",
      "values": [
        {
          "attribute_value_id": 10,
          "attribute_value": "LINE_START"
        },
        {
          "attribute_value_id": 12,
          "attribute_value": "COLUMN_START"
        },
        {
          "attribute_value_id": 14,
          "attribute_value": "SCROLL_START"
        }
      ]
    }
  ]
}

describe('Char', () => {

  let char
  beforeEach(() => {
    char = new Char(mockData)
  })

  describe('attributes', () => {
    let char,
    attributeID = 12345,
    attrs = () => ({
      sign_char_id: 1,
      sign_char: 'א',
      attributes: [
        {
          attribute_id: attributeID,
          attribute_value: 'some_value',
          attribute_description: 'attribute description'
        }
      ]
    })
    beforeEach(() => {
      char = new Char(attrs())
    })

    it('should create a List from the raw attributes', () => {
      expect((char.attributes instanceof AttributeList)).to.equal(true)
    })

    it('should accept a new attribute as an object', () => {
      char.addAttribute({
        attribute_id: 12346,
        attribute_value: 'some_value',
        attribute_description: 'attribute description'
      })
      expect(char.attributes.length).to.equal(2)
    })

    it('should accept a new attribute as an instance of Attribute', () => {
      const attribute = new Attribute({
        attribute_id: 12346,
        attribute_value: 'some_value',
        attribute_description: 'attribute description'
      })
      char.addAttribute(attribute)
      expect(char.attributes.length).to.equal(2)
      expect(char.attributes.get(1)).to.equal(attribute)
    })

    it('should remove an attribute by id', () => {
      char.removeAttribute(attributeID)
      expect(char.attributes.length).to.equal(0)
    })
  })
})