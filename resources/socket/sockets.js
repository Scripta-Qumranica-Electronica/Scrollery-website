const axios = require('axios')
const dns = require('dns')

let sqeAPI
const firstLower = /^\w/ // Regex to get first letter of string if lower case.

/**
 * Get requests:
 * These return data only to the socket that made the request.
 */
const getters = [
  'ListOfAttributes',
  'Combs',
  'ImagesOfInstFragments',
]

/**
 * Registered get requests:
 * These return data only to the socket that made the request.
 * They also register the socket for all mutations made to the
 * currently used scroll_version_id
 */
const registeredGetters = [
  'ColOfComb',
  'ImgOfComb',
  'ArtOfImage',
  'TextOfFragment',
]

/** 
 * Mutating requests:
 * These return information about completed database changes
 * to all sockets currently subscribed to the relevant
 * scroll_version_id.
 */
const mutators = [
  'removeSigns',
  'addSigns',
  'addSignAttribute',
  'removeSignAttribute',
]

module.exports = {
  sockets: (io) => {
     /**
      * For some reason axios fails to resolve requests to
      * http://SQE_CGI.  But if we use node's dns to find the
      * current IP address of the SQE_CGI container, we can use
      * that IP address in the axios request and everything
      * works fine.
      */
    dns.lookup('SQE_CGI', {family: 4}, (err, address, family) => {
      if (err) {
        console.error(err)
      } else {
        sqeAPI = `http://${address}/resources/cgi-bin/scrollery-cgi.pl`
        io.on('connection', function(socket){
          
          /**
           * Load up the regular getters.
           */
          for (let i = 0, getter; (getter = getters[i]); i++) {
            socket.on(`request${getter}`, (data) => {
              axios.post(sqeAPI, Object.assign({}, {transaction: `request${getter}`}, data))
                .then(res => {
                  socket.emit(`receive${getter}`, copyRequest(data, res.data, `request${getter}`))
                })
                .catch(err => console.error(err))
            })
          }
          
          /**
           * Load up the registered getters.  These also register the socket to recieve
           * notifications about mutations to the scroll_version_id it is
           * currently consuming.
           */
          for (let i = 0, registeredGetter; (registeredGetter = registeredGetters[i]); i++) {
            socket.on(`request${registeredGetter}`, (data) => {
              // We make sure this socket is only registered to
              // the room with this scroll_version_id.
              if(!socket.rooms[data.scroll_version_id]){
                socket.leaveAll()
                socket.join(data.scroll_version_id)
              }
              axios.post(sqeAPI, Object.assign({}, {transaction: `request${registeredGetter}`}, data))
                .then(res => {
                  socket.emit(`receive${registeredGetter}`, copyRequest(data, res.data, `request${registeredGetter}`))
                })
                .catch(err => console.error(err))
            })
          }
          
          /**
           * Load up the mutators.  These broadcast the response to all
           * sockets registered to the same scroll_version_id.
           */
          for (let i = 0, mutator; (mutator = mutators[i]); i++) {
            socket.on(mutator, (data) => {
              axios.post(sqeAPI, Object.assign({}, {transaction: mutator}, data))
                .then(res => {
                  io.to(data.scroll_version_id).emit(
                    `finish${mutator.replace(firstLower, c => c.toUpperCase())}`, 
                    copyRequest(data, res.data, mutator)
                  )
                })
                .catch(err => console.error(err))
            })
          }
        })
      }
    })
  },
}

// This is pobably a waste.  We send the request back with the
// response, but it must be sanitized first.
const copyRequest = (req, res, transaction) => {
  if (req.SESSION_ID) delete req.SESSION_ID
  if (req.user_id) delete req.user_id
  req.transaction = transaction
  return Object.assign({}, {payload: req}, res)
}