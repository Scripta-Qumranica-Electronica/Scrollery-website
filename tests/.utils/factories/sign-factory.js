import Sign from '~/models/-Sign.js'
import faker from 'faker'

const plain = props =>
  Object.assign(
    {
      sign_id: faker.random.number(),
      id: faker.random.number(),
      chars: [
        {
          sign_char: faker.random.word()[0],
          attributs: [],
        },
      ],
      next_sign_ids: [faker.random.number()],
    },
    props
  )

const model = props => new Sign(plain(props))

export default { plain, model }
