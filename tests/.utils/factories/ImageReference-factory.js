import ImageReference from '~/models/ImageReference.js'
import faker from 'faker'

const props = attrs => Object.assign(
  {
    institution: faker.random.word(),
    lvl1: faker.random.number(4000),
    lvl2: faker.random.number(100),
    side: faker.random.number(1),
    image_catalog_id: faker.random.number(1000000),
    images: [],
    artefacts: [],
    rois: []
  },
  attrs
)

const model = attrs => new ImageReference(props(attrs)) 

export default model