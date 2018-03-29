import List from '~/models/List.js'
import Model from '~/models/Model.js'

describe('List', () => {

  let list 
  beforeEach(() => {
    list = new List({id: 1, name: 'test'})
  })

  describe('inserting models', () => {

    it('should error out if not receiving a model instance', () => {
      expect(() => {
        list.push({})
      }).to.throw(TypeError)

      expect(() => {
        list.insert({}, 1)
      }).to.throw(TypeError)
    })

    it('should push items on the end of the others', () => {
      const line = new Model({id: 1, name: 'test'})
      list.push(new Model({id: 1, name: 'test'}))
      list.push(line) 
      expect(list.get(1)).to.equal(line)
    })

    it('should insert items at a specified index', () => {
      const line = new Model({id: 1, name: 'test'})
      list.push(new Model({id: 1, name: 'test'}))
      list.push(new Model({id: 1, name: 'test'}))
      list.insert(line, 1)
      expect(list.get(1)).to.equal(line)
    })

    it('should insert utens at the end of the items if index is more than the length', () => {
      const line = new Model({id: 1, name: 'test'})
      list.push(new Model({id: 1, name: 'test'}))
      list.push(new Model({id: 1, name: 'test'}))
      list.insert(line, 3)
      expect(list.get(2)).to.equal(line)
    })

    it('should know how many items it has', () => {
      list.push(new Model({id: 1, name: 'test'}))
      list.push(new Model({id: 1, name: 'test'})) 
      expect(list.count()).to.equal(2)
    })

  })

  describe('removing lines', () => {
    it('should delete line at a specified index', () => {
      list.push(new Model({id: 1, name: 'test'}))
      list.push(new Model({id: 1, name: 'test'})) 
      list.delete(0)
      expect(list.count()).to.equal(1)
    })
  })

})