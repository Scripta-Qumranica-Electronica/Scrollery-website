import axios from 'axios'

export default class Post {
  constructor(session_id) {
    this.session_id = session_id
  }

  post(url, payload, opts = {}) {
    /**
     * Inject the SESSION_ID into every request.
     */
    payload = Object.assign({}, payload, { SESSION_ID: this.session_id })

    /**
     * Inject the POST payload into the response.
     */
    opts = Object.assign({}, opts, {
      transformResponse: axios.defaults.transformResponse.concat(responseData => {
        responseData = Object.assign({}, responseData, { payload: payload })
        return responseData
      })
    })

    // make the AJAX request
    return axios.post(url, payload, opts)
  }
}
