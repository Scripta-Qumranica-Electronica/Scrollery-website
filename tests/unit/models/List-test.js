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
          name: 'test'
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

  describe('destroying', () => {
    it('should destroy itself and all sub-items', () => {
      // setup
      const model = new Model({ id: 1, name: 'test' })
      list.push(model)
      sinon.spy(model, 'destroy')

      // initialize destruction
      list.destroy()

      // assert
      expect(model.destroy).to.have.been.called
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
      const model = new Model({ id: 1, name: 'test' })
      list.push(new Model({ id: 1, name: 'test' }))
      list.push(model)
      expect(list.get(1)).to.equal(model)
    })

    it('should insert items at a specified index', () => {
      const model = new Model({ id: 1, name: 'test' })
      list.push(new Model({ id: 1, name: 'test' }))
      list.push(new Model({ id: 1, name: 'test' }))
      list.insert(model, 1)
      expect(list.get(1)).to.equal(model)
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

    it('should track the additions and return them in a getChanges call', () => {
      let model1 = new Model({ id: 1, name: 'test' })
      let model2 = new Model({ id: 2, name: 'test' })
      list.push(model1)
      list.push(model2)
      let changes = list.getChanges()
      expect(changes.additions[model1.getUUID()]).to.equal(model1)
      expect(changes.additions[model2.getUUID()]).to.equal(model2)
    })

    it('should know if a sub-item has changes', () => {
      let model1 = new Model({ id: 1, name: 'test' })
      list.push(model1)
      model1.name = 'new name'

      let changes = list.getChanges()
      expect(changes.updates[model1.getUUID()]).to.equal(model1)
    })
  })

  describe('hasChanges', () => {
    it('should return false if no changes', () => {
      expect(list.hasChanges()).to.equal(false)
    })

    it('should return true if only an addition', () => {
      list.push(new Model({ id: 1, name: 'test' }))
      expect(list.hasChanges()).to.equal(true)
    })

    it('should return true if only a deletion', () => {
      let model = new Model({ id: 1, name: 'test' })
      list.push(model)
      list.persisted({
        additions: {
          [model.getUUID()]: true
        }
      })
      list.delete(0)
      expect(list.hasChanges()).to.equal(true)
    })

    it('should return false after changes persisted', () => {
      let model = new Model({ id: 1, name: 'test' })

      // 1.a. addition
      list.push(model)
      expect(list.hasChanges()).to.equal(true)

      // 1.b. persist
      list.persisted({
        additions: {
          [model.getUUID()]: true
        }
      })
      expect(list.hasChanges()).to.equal(false)

      // 2.a. deletion
      list.delete(0)
      expect(list.hasChanges()).to.equal(true)

      // 2.b. persist
      list.persisted({
        deletions: {
          [model.getUUID()]: true
        }
      })
      expect(list.hasChanges()).to.equal(false)
    })

    it('should return true if a sub-item has been modified', () => {
      let model = new Model({ id: 1, name: 'test' })
      list.push(model)
      list.persisted({
        additions: {
          [model.getUUID()]: true
        }
      })
      model.name = 'new name'
      expect(list.hasChanges()).to.equal(true)
    })
  })

  describe('removing models', () => {
    it('should delete line at a specified index', () => {
      list.push(new Model({ id: 1, name: 'test' }))
      list.push(new Model({ id: 1, name: 'test' }))
      list.delete(0)
      expect(list.count()).to.equal(1)
    })

    it('should track the removal of items', () => {
      let model = new Model({ id: 1, name: 'test' })
      list.push(model)
      list.push(new Model({ id: 1, name: 'test' }))

      // mark everything persisted ... then do removal
      list.persisted({
        additions: {
          [model.getUUID()]: true
        }
      })

      // remove an item that should be marked in the changes object
      list.delete(0)

      let changes = list.getChanges()
      expect(changes.deletions[model.getUUID()]).to.equal(model)
    })

    it("should not track the deletion of an item that hasn't been persisted", () => {
      let model = new Model({ id: 1, name: 'test' })
      list.push(model)

      // remove an item that should be marked in the changes object
      // since it hasn't been persisted, it will not be on the deletions object
      list.delete(0)

      let changes = list.getChanges()
      expect(changes.deletions[model.getUUID()]).to.equal(undefined)
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
      // two methods do this, items / toArray: consider simplifying
      expect(Array.isArray(list.items())).to.equal(true)
      expect(Array.isArray(list.toArray())).to.equal(true)
    })
  })
})
