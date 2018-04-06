import axios from 'axios'

export default {
  /* istanbul ignore next */
  install(Vue, { store }) {
    /* istanbul ignore next */
    Vue.prototype.$post = function(url, data = {}, opt) {

      // Set SESSION_ID if available
      if (!data.SESSION_ID && store.getters.sessionID) {
        data.SESSION_ID = store.getters.sessionID
      }

      // make the AJAX request
      return axios.post(url, data, opt)
    }
  }
}