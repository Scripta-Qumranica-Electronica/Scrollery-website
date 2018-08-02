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
let image = imageIDs[getRandomArbitrary(0, imageIDs.length)]

describe('get image data', () => {
  it('should login the test/asdf user', done => {
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

  it('should get all images for an image_catalog_id', done => {
    request(app)
      .post('/resources/cgi-bin/scrollery-cgi.pl')
      .send({
        SESSION_ID: session_id,
        image_catalog_id: image.image_catalog_id,
        transaction: 'imagesOfInstFragments'
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
            assert(typeof item.sqe_image_id === 'number')
            assert(item.image_catalog_id === image.image_catalog_id)
            assert(item.dpi > 399 && item.dpi < 8001)
            assert(item.start > 100 && item.start < 1050)
            assert(item.end > 100 && item.end < 1050)
            assert(item.width > 0 && item.width < 1000000)
            assert(item.height > 0 && item.height < 1000000)
            assert(item.type >= 0 && item.type <= 3)
            assert(item.is_master === 0 || item.is_master === 1)
            assert(item.edition_side === 0 || item.edition_side === 1)
            assert(typeof item.filename === 'string')
            assert(typeof item.url === 'string')
            assert(item.url.indexOf('http') === 0)
            assert(typeof item.suffix === 'string')
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
