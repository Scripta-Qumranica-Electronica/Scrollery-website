import faker from 'faker'
import signFactory from './sign-factory.js'
import Column from '~/models/Column.js'
import Line from '~/models/Line.js'

export default ({ signs = 20, props = {} } = {}) => {
  props = Object.assign(
    {
      id: faker.random.number(),
      name: faker.random.word()
    },
    props
  )

  const col = new Column(props)

  let previousSignId,
    nextSignID,
    lineID = faker.random.number(),
    lineName = faker.random.word(),
    line = new Line({
      id: lineID,
      name: lineName
    }),
    signsInLine = 0

  col.push(line)
  for (var i = 0; i < signs; i++) {
    // determine if we should add a new line:
    // algorithm: if > 15 signs and faker says yes.
    if (signsInLine > 15 && faker.random.boolean()) {
      lineID = faker.random.number()
      lineName = faker.random.word()
      line = new Line({
        id: lineID,
        name: lineName
      })
      col.push(line)
      signsInLine = 0
    }

    // increment the signs in line
    signsInLine++

    // create the sign
    let sign = signFactory.model({
      sign_id: nextSignID,
      next_sign_ids: [faker.random.number()]
    })
    line.push(sign)

    // set state for next iteration
    previousSignId = sign.prev_sign_id
    nextSignID = sign.next_sign_id
  }

  return col
}
