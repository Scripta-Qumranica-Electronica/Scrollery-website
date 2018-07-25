import Record from '~/models/Record.js'

const name = 'test'

describe('Record', () => {
  let record, BaseClass
  beforeEach(() => {
    BaseClass = Record({ name })
    record = new BaseClass()
  })

  it('should create a class with a set of given defaults', () => {
    expect(record.name).to.equal(name)
  })

  it('should reset a value to the default when clearing out that value', () => {
    record.name = 'new name'
    expect(record.name).to.equal('new name')

    record.clear('name')
    expect(record.name).to.equal(name)
  })

  it('should know if it has a value or not', () => {
    expect(record.has('name')).to.equal(true)
    expect(record.has('property_it_does_not_have')).to.equal(false)
  })

  it('should retrieve methods via a getter api', () => {
    expect(record.get('name')).to.equal(name)
  })

  it('should extend the object with new properties in place (not create a new instance', () => {
    const updates = {
      val: true,
    }
    record.extend(updates)
    expect(record.val).to.equal(updates.val)
  })

  it('should return a new object via the toJS method', () => {
    expect(record.toJS()).not.to.equal(record)
  })

  it('should track updates to properties', () => {
    record.name = 'new name'
    expect(record.changedProperties()).to.include('name')
  })

  it('should remove tracking of changed properties after being persisted', () => {
    record.name = 'new name'
    expect(record.changedProperties()).to.include('name')

    record.persisted({ name: 'new name' })
    expect(Object.keys(record.changedProperties()).length).to.equal(0)
  })
})
