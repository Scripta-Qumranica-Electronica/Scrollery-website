import ROI from '~/models/ROI.js'
import faker from 'faker'

const props = attrs => Object.assign(
  {
    sign_char_roi_id: faker.random.number(1000000),
    sign_char_id: faker.random.number(1000000),
    path: 'POLYGON((0 0,0 10,10 10,10 0,0 0))',
    transform_matrix: '{"matrix":[[1,0,0],[0,1,0]]}'
  },
  attrs
)

const model = attrs => new ROI(props(attrs)) 

export default model