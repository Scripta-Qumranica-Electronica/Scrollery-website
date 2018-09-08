import Artefact from '~/models/Artefact.js'
import faker from 'faker'

const props = attrs =>
  Object.assign(
    {
      artefact_position_id: faker.random.number(1000000),
      artefact_id: faker.random.number(1000000),
      artefact_shape_id: faker.random.number(1000000),
      name: faker.random.word(),
      side: faker.random.number(1),
      mask: 'POLYGON((0 0,0 10,10 5,0 0))',
      transform_matrix: '{"matrix":[[1,0,0],[0,1,0]]}',
      rect: 'POLYGON((0 0,0 10,10 10,10 0,0 0))',
      image_catalog_id: faker.random.number(1000000),
      rois: [],
    },
    attrs
  )

const model = attrs => new Artefact(props(attrs))

export default model
