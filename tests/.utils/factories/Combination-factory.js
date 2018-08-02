import Combination from '~/models/Combination.js'
import faker from 'faker'

const plain = props =>
  Object.assign(
    {
      name: faker.random.word(),
      scroll_id: faker.random.number(1000000),
      scroll_version_id: faker.random.number(1000000),
      locked: faker.random.number(1),
      user_id: faker.random.number(1000000),
      cols: [],
      imageReferences: [],
      artefacts: [],
      rois: []
    },
    props
  )

const model = props => new Combination(plain(props))

export default model
