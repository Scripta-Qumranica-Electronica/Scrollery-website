const app = require('../../tools/app.js')
const request = require('supertest')
const assert = require('assert')
const imageIDs = require('./valid-image-ids')

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

let session_id = ''
let artefact_id = 0
let image = imageIDs[getRandomArbitrary(0, imageIDs.length)]

describe('get artefact data', () => {
  it('should login the test/asdf user', done => {
    request(app)
      .post('/resources/cgi-bin/scrollery-cgi.pl')
      .send({
        PASSWORD: 'asdf',
        SCROLLVERSION: 1,
        USER_NAME: 'test',
        transaction: 'validateSession',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }

        try {
          assert(res.body.SESSION_ID && typeof res.body.SESSION_ID === 'string')
          assert(res.body.SESSION_ID.length > 5)
          assert(res.body.USER_ID && typeof res.body.USER_ID === 'number')
          session_id = res.body.SESSION_ID
        } catch (err) {
          console.log(res.body)
          console.log(err.message)
          assert(false)
        }

        done()
      })
  })

  it('should get all user artefacts for an image_catalog_id', done => {
    request(app)
      .post('/resources/cgi-bin/scrollery-cgi.pl')
      .send({
        SESSION_ID: session_id,
        image_catalog_id: image.image_catalog_id,
        user_id: 1,
        transaction: 'getInstitutionArtefacts',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }

        try {
          artefact_id = res.body.results[0].artefact_id
          assert(res.body.results && Array.isArray(res.body.results))
          for (let i = 0, item; (item = res.body.results[i]); i++) {
            assert(typeof item.artefact_id === 'number')
            assert(item.user_id === 1)
          }
        } catch (err) {
          console.log(res.body)
          console.log(err.message)
          assert(false)
        }

        done()
      })
  })

  it('should get a mask for an artefact', done => {
    request(app)
      .post('/resources/cgi-bin/scrollery-cgi.pl')
      .send({
        SESSION_ID: session_id,
        scroll_version_id: image.scroll_version_id,
        artefact_id: artefact_id,
        transaction: 'getArtefactMask',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }

        try {
          assert(res.body.results && Array.isArray(res.body.results))
          for (let i = 0, item; (item = res.body.results[i]); i++) {
            assert(item.scroll_version_id === image.scroll_version_id)
            assert(item.mask.indexOf('POLYGON((') === 0)
            assert(item.rect.indexOf('POLYGON((') === 0)
            const matrix = JSON.parse(item.transform_matrix).matrix
            assert(matrix.length === 2 && matrix[0].length === 3 && matrix[1].length === 3)
          }
        } catch (err) {
          console.log(res.body)
          console.log(err.message)
          assert(false)
        }

        done()
      })
  })
})
