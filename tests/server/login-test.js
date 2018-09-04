const app = require('../../tools/app.js')
const request = require('supertest')
const assert = require('assert')

describe('login', () => {
  it('should attempt to login the test/asdf user', done => {
    request(app)
      .post('/resources/cgi-bin/scrollery-cgi.pl')
      .send({
        PASSWORD: 'asdf',
        SCROLLVERSION: 1,
        USER_NAME: 'test',
        transaction: 'validateSession'
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }

        assert(res.body.SESSION_ID.length > 5)
        done()
      })
  })
})
