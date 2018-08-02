const app = require('../../tools/app.js')
const request = require('supertest')
const assert = require('assert')
const imageIDs = require('./valid-image-ids')
const scrollVersionsWithData = require('./scroll-versions-with-data')

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

let session_id = ''
let user_id = 0
let scroll_version_id = scrollVersionsWithData[getRandomArbitrary(0, scrollVersionsWithData.length)]
let image = imageIDs[getRandomArbitrary(0, imageIDs.length)]

describe('get menu data', () => {
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
          user_id = res.body.USER_ID
        } catch (err) {
          console.log(res.body)
          console.log(err.message)
          assert(false)
        }

        done()
      })
  })

  it('should get all default and user combinations', done => {
    request(app)
      .post('/resources/cgi-bin/scrollery-cgi.pl')
      .send({
        SESSION_ID: session_id,
        user_id: user_id,
        transaction: 'getCombs'
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
            assert(typeof item.scroll_version_id === 'number')
            assert(typeof item.scroll_id === 'number')
            assert(item.locked === 0 || item.locked === 1)
            assert(typeof item.scroll_data_id === 'number')
            assert(item.user_id === 1 || item.user_id === user_id)
            assert(typeof item.name === 'string')
          }
        } catch (err) {
          console.log(res.body)
          console.log(err.message)
          assert(false)
        }

        done()
      })
  })

  it('should get text columns of a combination', done => {
    request(app)
      .post('/resources/cgi-bin/scrollery-cgi.pl')
      .send({
        SESSION_ID: session_id,
        scroll_version_id: scroll_version_id,
        transaction: 'getColOfComb'
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
            assert(typeof item.col_id === 'number')
            assert(typeof item.scroll_version_id === 'number')
            assert(typeof item.name === 'string')
          }
        } catch (err) {
          console.log(res.body)
          console.log(err.message)
          assert(false)
        }

        done()
      })
  })

  it("should get all artefact_id's of a combination", done => {
    request(app)
      .post('/resources/cgi-bin/scrollery-cgi.pl')
      .send({
        SESSION_ID: session_id,
        scroll_version_id: scroll_version_id,
        transaction: 'getArtOfComb'
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
            assert(typeof item.artefact_id === 'number')
            assert(typeof item.scroll_version_id === 'number')
            assert(typeof item.name === 'string')
          }
        } catch (err) {
          console.log(res.body)
          console.log(err.message)
          assert(false)
        }

        done()
      })
  })

  it('should get all artefact data of a combination', done => {
    request(app)
      .post('/resources/cgi-bin/scrollery-cgi.pl')
      .send({
        SESSION_ID: session_id,
        scroll_version_id: scroll_version_id,
        transaction: 'getScrollArtefacts'
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
            assert(typeof item.filename === 'string')
            assert(typeof item.url === 'string')
            assert(item.url.indexOf('http') === 0)
            assert(typeof item.suffix === 'string')
            assert(typeof item.artefact_id === 'number')
            assert(typeof item.artefact_position_id === 'number')
            assert(typeof item.artefact_shape_id === 'number')
            assert(typeof item.artefact_data_id === 'number')
            assert(typeof item.image_catalog_id === 'number')
            assert(item.scroll_version_id === scroll_version_id)
            assert(typeof item.name === 'string')
            assert(item.dpi > 399 && item.dpi < 8001)
            assert(item.side === 0 || item.side === 1)
            assert(item.mask.indexOf('POLYGON((') === 0)
            assert(item.rect.indexOf('POLYGON((') === 0)
            const matrix = JSON.parse(item.transform_matrix).matrix
            assert(matrix.length === 2 && matrix[0].length === 3 && matrix[1].length === 3)
          }
        } catch (err) {
          console.log(res.body)
          console.log(err.message)
          console.log(`The failed scroll_version_id is: ${scroll_version_id}`)
          assert(false)
        }

        done()
      })
  })

  it('should get all images of a combination', done => {
    request(app)
      .post('/resources/cgi-bin/scrollery-cgi.pl')
      .send({
        SESSION_ID: session_id,
        scroll_version_id: scroll_version_id,
        transaction: 'getImgOfComb'
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
            assert(typeof item.image_catalog_id === 'number')
            assert(typeof item.scroll_version_id === 'number')
            assert(item.side === 0 || item.side === 1)
            assert(typeof item.institution === 'string')
            assert(typeof item.lvl1 === 'string')
            assert(typeof item.lvl2 === 'string')
          }
        } catch (err) {
          console.log(res.body)
          console.log(err.message)
          console.log(`The failed scroll_version_id is: ${scroll_version_id}`)
          assert(false)
        }

        done()
      })
  })

  it('should get all artefacts of an image', done => {
    request(app)
      .post('/resources/cgi-bin/scrollery-cgi.pl')
      .send({
        SESSION_ID: session_id,
        scroll_version_id: image.scroll_version_id,
        image_catalog_id: image.image_catalog_id,
        transaction: 'getArtOfImage'
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
            assert(typeof item.artefact_id === 'number')
            assert(typeof item.image_catalog_id === 'number')
            assert(typeof item.scroll_version_id === 'number')
            assert(typeof item.name === 'string')
            assert(item.side === 0 || item.side === 1)
            assert(item.mask.indexOf('POLYGON((') === 0)
            assert(item.rect.indexOf('POLYGON((') === 0)
            const matrix = JSON.parse(item.transform_matrix).matrix
            assert(matrix.length === 2 && matrix[0].length === 3 && matrix[1].length === 3)
          }
        } catch (err) {
          console.log(res.body)
          console.log(err.message)
          console.log(`The failed scroll_version_id is: ${image.scroll_version_id}`)
          console.log(`The failed image_catalog_id is: ${image.image_catalog_id}`)
          assert(false)
        }

        done()
      })
  })

  it('should get the width of a scroll', done => {
    request(app)
      .post('/resources/cgi-bin/scrollery-cgi.pl')
      .send({
        SESSION_ID: session_id,
        scroll_version_id: image.scroll_version_id,
        transaction: 'getScrollWidth'
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
            assert(typeof item.artefact_id === 'number')
            assert(typeof item.max_x === 'number')
          }
        } catch (err) {
          console.log(res.body)
          console.log(err.message)
          assert(false)
        }

        done()
      })
  })

  it('should get the height of a scroll', done => {
    request(app)
      .post('/resources/cgi-bin/scrollery-cgi.pl')
      .send({
        SESSION_ID: session_id,
        scroll_version_id: image.scroll_version_id,
        transaction: 'getScrollHeight'
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
            assert(typeof item.artefact_id === 'number')
            assert(typeof item.max_y === 'number')
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
