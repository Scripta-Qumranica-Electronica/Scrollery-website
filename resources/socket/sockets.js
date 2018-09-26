const axios = require('axios')
const dns = require('dns')
let sqeAPI

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
          // Load all the listeners
          for (let listener in listeners) {
            if (listeners.hasOwnProperty(listener)) {
              listeners[listener](io, socket)
            }
          }
        })
      }
    })
  },
}

/**
 * All listeners in this object are loaded automatically.
 */
const listeners = {
  
  // Get requests:
  // These return data only to the socket that made the request.
  // TODO: there is a lot of repetition here, perhaps we could make this
  // a bit more DRY.
  
  getListOfAttributes: (io, socket) => {
    socket.on('getListOfAttributes', (data) => {
      const transaction = 'getListOfAttributes'
      axios.post(sqeAPI, Object.assign({}, {transaction: transaction}, data))
        .then(res => {
          socket.emit('receiveListOfAttributes', copyRequest(data, res.data, transaction))
        })
        .catch(err => console.error(err))
    })
  },
  
  getAllCombinations: (io, socket) => {
    socket.on('getCombs', (data) => {
      const transaction = 'getCombs'
      axios.post(sqeAPI, Object.assign({}, {transaction: transaction}, data))
        .then(res => {
          socket.emit('receiveCombs', copyRequest(data, res.data, transaction))
        })
        .catch(err => console.error(err))
    })
  },
  
  getColOfComb: (io, socket) => {
    socket.on('getColOfComb', (data) => {
      socket.join(data.scroll_version_id)
      const transaction = 'getColOfComb'
      axios.post(sqeAPI, Object.assign({}, {transaction: transaction}, data))
        .then(res => {
          socket.emit('receiveColOfComb', copyRequest(data, res.data, transaction))
        })
        .catch(err => console.error(err))
    })
  },
  
  getImgOfComb: (io, socket) => {
    socket.on('getImgOfComb', (data) => {
      socket.join(data.scroll_version_id)
      const transaction = 'getImgOfComb'
      axios.post(sqeAPI, Object.assign({}, {transaction: transaction}, data))
        .then(res => {
          socket.emit('receiveImgOfComb', copyRequest(data, res.data, transaction))
        })
        .catch(err => console.error(err))
    })
  },
  
  getArtOfImage: (io, socket) => {
    socket.on('getArtOfImage', (data) => {
      socket.join(data.scroll_version_id)
      const transaction = 'getArtOfImage'
      axios.post(sqeAPI, Object.assign({}, {transaction: transaction}, data))
        .then(res => {
          socket.emit('receiveArtOfImage', copyRequest(data, res.data, transaction))
        })
        .catch(err => console.error(err))
    })
  },
  
  imagesOfInstFragments: (io, socket) => {
    socket.on('imagesOfInstFragments', (data) => {
      socket.join(data.scroll_version_id)
      const transaction = 'imagesOfInstFragments'
      axios.post(sqeAPI, Object.assign({}, {transaction: transaction}, data))
        .then(res => {
          socket.emit('receiveImagesOfInstFragments', copyRequest(data, res.data, transaction))
        })
        .catch(err => console.error(err))
    })
  },
  
  getTextOfFragment: (io, socket) => {
    socket.on('getTextOfFragment', (data) => {
      socket.join(data.scroll_version_id)
      const transaction = 'getTextOfFragment'
      axios.post(sqeAPI, Object.assign({}, {transaction: transaction}, data))
        .then(res => {
          socket.emit('receiveTextOfFragment', copyRequest(data, res.data, transaction))
        })
        .catch(err => console.error(err))
    })
  },
  
  // Mutating requests:
  // These return information about completed database changes
  // to all sockets currently subscribed to the relevant
  // scroll_version_id.
  
  removeSigns: (io, socket) => {
    socket.on('removeSigns', (data) => {
      const transaction = 'removeSigns'
      axios.post(sqeAPI, Object.assign({}, {transaction: transaction}, data))
        .then(res => {
          io.to(data.scroll_version_id).emit('finishRemoveSigns', copyRequest(data, res.data, transaction))
        })
        .catch(err => console.error(err))
    })
  },
  
  addSigns: (io, socket) => {
    socket.on('addSigns', (data) => {
      const transaction = 'addSigns'
      axios.post(sqeAPI, Object.assign({}, {transaction: transaction}, data))
        .then(res => {
          io.to(data.scroll_version_id).emit('finishAddSigns', copyRequest(data, res.data, transaction))
        })
        .catch(err => console.error(err))
    })
  },
  
  addSignAttribute: (io, socket) => {
    const transaction = 'addSignAttribute'
    socket.on(transaction, (data) => {
      axios.post(sqeAPI, Object.assign({}, {transaction: transaction}, data))
        .then(res => {
          io.to(data.scroll_version_id).emit('finishAddSignAttribute', copyRequest(data, res.data, transaction))
        })
        .catch(err => console.error(err))
    })
  },
  
  removeSignAttribute: (io, socket) => {
    const transaction = 'removeSignAttribute'
    socket.on(transaction, (data) => {
      console.log(data)
      axios.post(sqeAPI, Object.assign({}, {transaction: transaction}, data))
        .then(res => {
          io.to(data.scroll_version_id).emit('finishRemoveSignAttribute', copyRequest(data, res.data, transaction))
        })
        .catch(err => console.error(err))
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