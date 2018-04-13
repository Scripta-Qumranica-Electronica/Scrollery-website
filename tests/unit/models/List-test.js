import List from '~/models/List.js'

const Model = List.getModel()

describe('List', () => {
  let list
  beforeEach(() => {
    list = new List({ id: 1, name: 'test' })
  })

  describe('instantiating', () => {
    it('should accept attributes and a list of items', () => {
      list = new List(
        {
          id: 1,
          name: 'test',
        },
        [new Model(), new Model()]
      )
      expect(list.id).to.equal(1)
      expect(list.length).to.equal(2)
    })

    it('should know attributes', () => {
      expect(list.getID()).to.equal(1)
    })
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
      const line = new Model({ id: 1, name: 'test' })
      list.push(new Model({ id: 1, name: 'test' }))
      list.push(line)
      expect(list.get(1)).to.equal(line)
    })

    it('should insert items at a specified index', () => {
      const line = new Model({ id: 1, name: 'test' })
      list.push(new Model({ id: 1, name: 'test' }))
      list.push(new Model({ id: 1, name: 'test' }))
      list.insert(line, 1)
      expect(list.get(1)).to.equal(line)
    })

    it('should insert items at the end of the items if index is more than the length', () => {
      const line = new Model({ id: 1, name: 'test' })
      list.push(new Model({ id: 1, name: 'test' }))
      list.push(new Model({ id: 1, name: 'test' }))
      list.insert(line, 3)
      expect(list.get(2)).to.equal(line)
    })

    it('should know how many items it has', () => {
      list.push(new Model({ id: 1, name: 'test' }))
      list.push(new Model({ id: 1, name: 'test' }))
      expect(list.count()).to.equal(2)
    })
  })

  describe('removing models', () => {
    it('should delete line at a specified index', () => {
      list.push(new Model({ id: 1, name: 'test' }))
      list.push(new Model({ id: 1, name: 'test' }))
      list.delete(0)
      expect(list.count()).to.equal(1)
    })
  })

  describe('sliceInto: creating new lists from partial lists', () => {
    beforeEach(() => {
      ;[1, 2, 3, 4].forEach(id => {
        list.push(new Model({ id, name: `test_${id}` }))
      })
    })

    it('should create a new target list if not given one', () => {
      let target = list.sliceInto(0, 2)
      expect(target instanceof List).to.equal(true)
      expect(target.length).to.equal(2)
    })

    it('should use the target list if given one', () => {
      let target = new List()
      target = list.sliceInto(0, 2, target)
      expect(target).to.equal(target)
      expect(target.length).to.equal(2)
    })
  })

  describe('find', () => {
    beforeEach(() => {
      ;[1, 2, 3, 4].forEach(id => {
        list.push(new Model({ id, name: `test_${id}` }))
      })
    })

    it('should find an item by custom callback', () => {
      const model = list.get(0)
      expect(list.find(m => m.getID() === model.getID())).to.equal(model)
    })
  })

  describe('findIndex', () => {
    beforeEach(() => {
      ;[1, 2, 3, 4].forEach(id => {
        list.push(new Model({ id, name: `test_${id}` }))
      })
    })

    it('by id', () => {
      expect(list.findIndex(1)).to.equal(0)
    })

    it('by model instance', () => {
      const model = new Model({ id: 5 })
      list.push(model)
      expect(list.findIndex(model)).to.equal(4)
    })

    it('by custom callback', () => {
      expect(list.findIndex(model => model.getID() === 1)).to.equal(0)
    })
  })

  describe('items', () => {
    it('should expose the items (dangerously?) of the list as an array', () => {
      expect(Array.isArray(list.items())).to.equal(true)
    })
  })
})
