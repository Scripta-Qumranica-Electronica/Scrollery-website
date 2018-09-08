import makeModel from '~/models/extendModel.js'

const name = 'test record name'

describe('model', () => {
  let Model
  beforeEach(() => {
    Model = makeModel({ name })
  })

  it('should have an id by default', () => {
    const model = new Model()
    expect(model.getID()).to.equal(0)
  })

  it('should accept an id property', () => {
    const model = new Model({ id: 1 })
    expect(model.getID()).to.equal(1)
  })

  it('should set a default property', () => {
    const model = new Model()
    expect(model.name).to.equal(name)
  })
})
