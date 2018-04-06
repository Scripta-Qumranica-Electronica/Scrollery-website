import faker from 'faker'
import signFactory from './sign-factory.js'

/**
 * Construct a sign stream
 */
export default ({signsCount = 20, colProps = {}}) => {
  let signs = []
  colProps = Object.assign({
    id: faker.random.uuid(),
    name: faker.random.word()
  }, colProps)

  let previousSignId = "", nextSignID = faker.random.uuid(),
  lineID = faker.random.uuid(),
  lineName = faker.random.word(),
  signsInLine = 0
  for (var i = 0; i < signsCount; i++) {
    
    // determine if we should add a new line:
    // algorithm: if > 15 signs and faker says yes.
    if (signsInLine > 15 && faker.random.boolean()) {
      lineID = faker.random.uuid()
      lineName = faker.random.word();
      signsInLine = 0
    }

    // increment the signs in line
    signsInLine++;

    // create the plain sign object
    let sign = signFactory.plain({
      sign_id: nextSignID,
      prev_sign_id: previousSignId,
      next_sign_id: faker.random.uuid(),
      line_id: lineID,
      line_name: lineName,
      col_id: colProps.id,
      col_name: colProps.name
    })
    signs.push(sign)

    // set state for next iteration
    previousSignId = sign.prev_sign_id
    nextSignID = sign.next_sign_id
  }

  // remove the next_sign_id from the final element
  delete signs[signsCount - 1].next_sign_id

  return signs
}