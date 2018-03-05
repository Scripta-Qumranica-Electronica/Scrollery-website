import axios from 'axios'

export default {
  install(Vue, { store }) {
    Vue.prototype.$post = function(url, data = {}, opt) {

      // Set SESSION_ID if available
      if (!data.SESSION_ID && store.getters.sessionID) {
        data.SESSION_ID = store.getters.sessionID
      }

      // return axios({
      //   url,
      //   method: 'post',
      //   data: data,
      //   header: {'Content-Type': 'application/json' }
      // })

      // make the AJAX request
      return axios.post(url, data, opt)
    }
  }
}