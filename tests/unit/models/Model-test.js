import Model from '~/models/Model.js'

describe('model', () => {
  it('should have an id by default', () => {
    const model = new Model()
    expect(model.getID()).to.equal(0)
  })

  it('should accept an id property', () => {
    const model = new Model({ id: 1 })
    expect(model.getID()).to.equal(1)
  })
})
