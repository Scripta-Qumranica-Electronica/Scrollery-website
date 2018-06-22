/**
 * TODO: stub out tests for manipulating rois
 */

const app = require('../../tools/app.js')
const request = require('supertest')
const assert = require('assert')
const imageIDs = require('./valid-image-ids')

let session_id = ''
let artefact_id = 0
let sqe_image_id = 0
let scroll_version_id = 0
let image = imageIDs[getRandomArbitrary(0, imageIDs.length)]

// describe('getting roi data', () => {
// })

// describe('manipulating rois', () => {
//   it('should login the test/asdf user', done => {
//     request(app)
//       .post('/resources/cgi-bin/scrollery-cgi.pl')
//       .send({
//         PASSWORD: 'asdf',
//         SCROLLVERSION: 1,
//         USER_NAME: 'test',
//         transaction: 'validateSession',
//       })
//       .expect('Content-Type', /json/)
//       .expect(200)
//       .end(function(err, res) {
//         if (err) {
//           return done(err)
//         }

//         try {
//           assert(res.body.SESSION_ID && typeof res.body.SESSION_ID === 'string')
//           assert(res.body.SESSION_ID.length > 5)
//           assert(res.body.USER_ID && typeof res.body.USER_ID === 'number')
//           session_id = res.body.SESSION_ID
//         } catch (err) {
//           console.log(res.body)
//           console.log(err.message)
//           assert(false)
//         }

//         done()
//       })
//   })

//   it('should clone a scroll', done => {
//     request(app)
//     .post('/resources/cgi-bin/scrollery-cgi.pl')
//     .send({
//       SESSION_ID: session_id,
//       scroll_version_id: image.scroll_version_id,
//       transaction: 'copyCombination',
//     })
//     .expect('Content-Type', /json/)
//     .expect(200)
//     .end(function(err, res) {
//       if (err) {
//         return done(err)
//       }

//       try {
//         assert(typeof res.body.set_scroll_version.returned_info === 'number')
//         assert(typeof res.body.new_scroll_id === 'number')
//         assert(res.body.scroll_data)
//         assert(res.body.scroll_data.locked === 0)
//         assert(typeof res.body.scroll_data.name === 'string')
//         scroll_version_id = res.body.new_scroll_id
//       } catch(err) {
//         console.log(res.body)
//         console.log(err.message)
//         console.log(`The failed scroll_version_id is: ${image.scroll_version_id}`)
//         assert(false)
//       }
      
//       done()
//     })
//   })
// })

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}