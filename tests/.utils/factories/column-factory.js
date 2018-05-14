import faker from 'faker'
import signFactory from './sign-factory.js'
import Column from '~/models/Column.js'

export default ({ signs = 20, props = {} } = {}) => {
  props = Object.assign(
    {
      id: faker.random.number(),
      name: faker.random.word(),
    },
    props
  )

  const col = new Column(props)

  let previousSignId,
    nextSignID,
    lineID = faker.random.number(),
    lineName = faker.random.word(),
    signsInLine = 0
  for (var i = 0; i < signs; i++) {
    // determine if we should add a new line:
    // algorithm: if > 15 signs and faker says yes.
    if (signsInLine > 15 && faker.random.boolean()) {
      lineID = faker.random.number()
      lineName = faker.random.word()
      signsInLine = 0
    }

    // increment the signs in line
    signsInLine++

    // create the sign
    let sign = signFactory.model({
      sign_id: nextSignID,
      prev_sign_id: previousSignId,
      next_sign_id: faker.random.number(),
      line_id: lineID,
      line_name: lineName,
      col_id: col.getID(),
      col_name: col.name,
    })
    col.insertSign(sign)

    // set state for next iteration
    previousSignId = sign.prev_sign_id
    nextSignID = sign.next_sign_id
  }

  return col
}
