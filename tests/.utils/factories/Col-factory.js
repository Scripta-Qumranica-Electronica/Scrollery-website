import Col from '~/models/Col.js'
import faker from 'faker'

const props = attrs =>
  Object.assign(
    {
      col_id: faker.random.number(1000000),
      name: faker.random.word(),
      rois: [],
    },
    attrs
  )

const model = attrs => new Col(props(attrs))

export default model
