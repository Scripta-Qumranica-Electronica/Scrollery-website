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
let sqe_image_id = 0
let scroll_version_id = 0
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
          console.log(`The failed scroll_version_id is: ${image.scroll_version_id}`)
          console.log(`The failed artefact_id is: ${artefact_id}`)
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
        scroll_version_id: image.scroll_version_id,
        transaction: 'getScrollArtefacts',
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
            assert(typeof item.id_of_sqe_image === 'number')
            assert(item.scroll_version_id === image.scroll_version_id)
            assert(typeof item.name === 'string')
            assert(item.dpi > 399 && item.dpi < 8001)
            assert(item.side === 0 || item.side === 1)
            assert(item.mask.indexOf('POLYGON((') === 0)
            assert(item.rect.indexOf('POLYGON((') === 0)
            const matrix = JSON.parse(item.transform_matrix).matrix
            assert(matrix.length === 2 && matrix[0].length === 3 && matrix[1].length === 3)
            sqe_image_id = item.id_of_sqe_image
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

/**
 * TODO I need to check some of the returned data here a
 * bit better.  Tests do work, but should validate a bit
 * more cleanly.
 */

describe('manipulate artefact data', () => {
  it('should clone a scroll', done => {
    request(app)
      .post('/resources/cgi-bin/scrollery-cgi.pl')
      .send({
        SESSION_ID: session_id,
        scroll_version_id: image.scroll_version_id,
        transaction: 'copyCombination',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }

        try {
          assert(typeof res.body.set_scroll_version.returned_info === 'number')
          assert(typeof res.body.new_scroll_id === 'number')
          assert(res.body.scroll_data)
          assert(res.body.scroll_data.locked === 0)
          assert(typeof res.body.scroll_data.name === 'string')
          scroll_version_id = res.body.new_scroll_id
        } catch (err) {
          console.log(res.body)
          console.log(err.message)
          console.log(`The failed scroll_version_id is: ${image.scroll_version_id}`)
          assert(false)
        }

        done()
      })
  })

  it('should be able to create a new artefact', done => {
    request(app)
      .post('/resources/cgi-bin/scrollery-cgi.pl')
      .send({
        SESSION_ID: session_id,
        scroll_version_id: scroll_version_id,
        id_of_sqe_image: sqe_image_id,
        region_in_master_image: 'POLYGON((0 0,0 30,30 30,30 0,0 0),(5 5,5 10,10 10,10 5,5 5))',
        transaction: 'addArtefact',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }

        try {
          assert(res.body.returned_info)
          assert(typeof res.body.returned_info === 'number')
          artefact_id = res.body.returned_info
        } catch (err) {
          console.log(res.body)
          console.log(err.message)
          console.log(`The failed scroll_version_id is: ${scroll_version_id}`)
          console.log(`The failed sqe_image_id is: ${sqe_image_id}`)
          assert(false)
        }

        done()
      })
  })

  it('should be able to change the shape of an artefact', done => {
    const region_in_master_image = 'POLYGON((0 0,0 60,60 60,60 0,0 0),(5 5,5 20,20 20,20 5,5 5))'
    request(app)
      .post('/resources/cgi-bin/scrollery-cgi.pl')
      .send({
        SESSION_ID: session_id,
        scroll_version_id: scroll_version_id,
        artefact_id: artefact_id,
        id_of_sqe_image: sqe_image_id,
        region_in_master_image: region_in_master_image,
        transaction: 'changeArtefactShape',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }

        // try {
        //   assert(res.body.results && Array.isArray(res.body.results))
        //   for (let i = 0, item; (item = res.body.results[i]); i++) {
        //     assert(item.scroll_version_id === scroll_version_id)
        //     assert(item.artefact_id === artefact_id)
        //     assert(item.region_in_master_image === region_in_master_image)
        //   }
        // } catch (err) {
        //   console.log(res.body)
        //   console.log(err.message)
        //   console.log(`The failed scroll_version_id is: ${scroll_version_id}`)
        //   console.log(`The failed sqe_image_id is: ${sqe_image_id}`)
        //   console.log(`The failed artefact_id is: ${artefact_id}`)
        //   assert(false)
        // }

        done()
      })
  })

  it('should be able to change the position of an artefact', done => {
    const transform_matrix = '{"matrix":[[1,0,20],[0,1,34]]}'
    const z_index = 0
    request(app)
      .post('/resources/cgi-bin/scrollery-cgi.pl')
      .send({
        SESSION_ID: session_id,
        scroll_version_id: scroll_version_id,
        artefact_id: artefact_id,
        transform_matrix: transform_matrix,
        z_index: z_index,
        transaction: 'changeArtefactPosition',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }

        // try {
        //   assert(res.body.results && Array.isArray(res.body.results))
        //   for (let i = 0, item; (item = res.body.results[i]); i++) {
        //     assert(item.scroll_version_id === scroll_version_id)
        //     assert(item.artefact_id === artefact_id)
        //     assert(item.transform_matrix === transform_matrix)
        //     assert(item.z_index === z_index)
        //   }
        // } catch (err) {
        //   console.log(res.body)
        //   console.log(err.message)
        //   console.log(`The failed scroll_version_id is: ${scroll_version_id}`)
        //   console.log(`The failed artefact_id is: ${artefact_id}`)
        //   assert(false)
        // }

        done()
      })
  })

  it('should be able to change the name of an artefact', done => {
    const name = 'heavily altered artefact'
    request(app)
      .post('/resources/cgi-bin/scrollery-cgi.pl')
      .send({
        SESSION_ID: session_id,
        scroll_version_id: scroll_version_id,
        artefact_id: artefact_id,
        name: name,
        transaction: 'changeArtefactData',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }

        // try {
        //   assert(res.body.results && Array.isArray(res.body.results))
        //   for (let i = 0, item; (item = res.body.results[i]); i++) {
        //     assert(item.scroll_version_id === scroll_version_id)
        //     assert(item.artefact_id === artefact_id)
        //     assert(item.name === name)
        //   }
        // } catch (err) {
        //   console.log(res.body)
        //   console.log(err.message)
        //   console.log(`The failed scroll_version_id is: ${scroll_version_id}`)
        //   console.log(`The failed artefact_id is: ${artefact_id}`)
        //   assert(false)
        // }

        done()
      })
  })

  it('should be able to delete an artefact', done => {
    request(app)
      .post('/resources/cgi-bin/scrollery-cgi.pl')
      .send({
        SESSION_ID: session_id,
        scroll_version_id: scroll_version_id,
        artefact_id: artefact_id,
        sqe_image_id: sqe_image_id,
        transaction: 'removeArtefact',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }

        // try {
        //   assert(res.body.deleted)
        //   assert(res.body.deleted === artefact_id)
        // } catch (err) {
        //   console.log(res.body)
        //   console.log(err.message)
        //   console.log(`The failed scroll_version_id is: ${scroll_version_id}`)
        //   console.log(`The failed sqe_image_id is: ${sqe_image_id}`)
        //   console.log(`The failed artefact_id is: ${artefact_id}`)
        //   assert(false)
        // }

        done()
      })
  })
})
