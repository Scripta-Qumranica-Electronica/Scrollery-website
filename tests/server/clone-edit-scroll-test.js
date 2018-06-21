// const app = require('../../tools/app.js')
// const request = require('supertest')
// const assert = require('assert')

// /**
//  * Returns a random number between min (inclusive) and max (exclusive)
//  */
// function getRandomArbitrary(min, max) {
//   return Math.floor(Math.random() * (max - min) + min);
// }

// let session_id = ''
// let scrollVersionsWithArtData = [3,  217,  218,  225,  226,  227,  228,  231,  232,  233,  234,  381,  382,  383,  402,  452,  453,  454,  455,  457,  458,  460,  498,  513,  514,  516,  520,  617,  618,  619,  620,  621,  622,  808,  894,  1023,  1606]
// let scroll_version_id = scrollVersionsWithArtData[getRandomArbitrary(0, scrollVersionsWithArtData.length)]
// console.log(`Initial scroll version: ${scroll_version_id}.`)

// describe('clone scroll', () => {
//   it('should attempt to login the test/asdf user', done => {
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

//         assert(typeof res.body.SESSION_ID === 'string')
//         assert(res.body.SESSION_ID.length > 5)
//         session_id = res.body.SESSION_ID
//         done()
//       })
//   })

//   it('should clone a scroll', done => {
//     request(app)
//     .post('/resources/cgi-bin/scrollery-cgi.pl')
//     .send({
//       SESSION_ID: session_id,
//       scroll_version_id: scroll_version_id,
//       transaction: 'copyCombination',
//     })
//     .expect('Content-Type', /json/)
//     .expect(200)
//     .end(function(err, res) {
//       if (err) {
//         return done(err)
//       }

//       assert(res.body.set_scroll_version && 
//         typeof res.body.set_scroll_version.returned_info === 'number')
//       assert(res.body.new_scroll_id &&
//         typeof res.body.new_scroll_id === 'number')
//       assert(res.body.scroll_data)
//       assert(res.body.scroll_data.locked === 0)
//       assert(res.body.scroll_data.name && typeof res.body.scroll_data.name === 'string')
//       scroll_version_id = res.body.new_scroll_id
//       done()
//     })
//   })
// })