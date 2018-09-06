import axios from 'axios'

export default {
  /* istanbul ignore next */
  install(Vue, { store, }) {
    /* istanbul ignore next */
    Vue.prototype.$post = function(url, data = {}, opt = {}) {
      // Set SESSION_ID if available
      if (!data.SESSION_ID && store.getters.sessionID) {
        data.SESSION_ID = store.getters.sessionID
      }

      /**
       * We must add the scroll_version_id from the request back
       * into the response.  This is necessary for tracking
       * ID's, since we use the meta ID's like col_id and
       * artefact_id to access data in the col_data and
       * artefact_shape tables, and thus would not get the
       * proper entry without knowing the relevant scroll_version_id.
       * We simply insert the request back in to the response.
       */
      if (data.scroll_version_id) {
        opt = Object.assign({}, opt, {
          transformResponse: axios.defaults.transformResponse.concat(responseData => {
            responseData = Object.assign({}, responseData, { payload: data, })
            return responseData
          }),
        })
      }

      // make the AJAX request
      return axios.post(url, data, opt)
    }
  },
}
