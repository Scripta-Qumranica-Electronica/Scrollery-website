import Image from '~/models/Image.js'
import faker from 'faker'

const props = attrs =>
  Object.assign(
    {
      sqe_image_id: faker.random.number(1000000),
      url: faker.internet.domainName(),
      filename: 'xcf56743-gjth',
      width: faker.random.number({ min: 1200, max: 12000 }),
      height: faker.random.number({ min: 1200, max: 12000 }),
      dpi: faker.random.number({ min: 400, max: 12000 }),
      type: faker.random.number(4),
      start: 480,
      end: 920,
      is_master: faker.random.number(1),
      suffix: 'default.jpg',
      editionSide: faker.random.number(1),
    },
    attrs
  )

const model = attrs => new Image(props(attrs))

export default model
