const app = require('../../tools/app.js')
const request = require('supertest')
const assert = require('assert')

describe('Sign functionality', () => {

  let sessionID
  before(() => {
    return request(app)
      .post('/resources/cgi-bin/scrollery-cgi.pl')
      .send({
        USER_NAME: 'test',
        PASSWORD: 'asdf',
        SCROLLVERSION: 1,
        transaction: 'validateSession',
      })
      .then(res => {
        sessionID = res.body.SESSION_ID
      })
  })

  const send = payload => request(app)
  .post('/resources/cgi-bin/scrollery-cgi.pl')
  .send({
    ...payload,
    SESSION_ID: sessionID
  })

  it('should attempt to login the test/asdf user', done => {
    return send({
      transaction: 'getTextOfFragment',
      scroll_version_id: 808,
      col_id: 9111
    })
    .expect(200)
    .then(res => {
      console.log(res.body)
    })
  })
})
