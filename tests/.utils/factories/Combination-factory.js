import Combination from '~/models/Combination.js'
import faker from 'faker'

const props = attrs => Object.assign(
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
  attrs
)

const model = attrs => new Combination(props(attrs)) 

export default model