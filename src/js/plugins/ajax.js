import axios from 'axios'

export default {
  install(Vue, { store }) {
    Vue.prototype.$post = function(url, data = {}, opt) {

      // Set SESSION_ID if available
      if (!data.SESSION_ID && store.getters.sessionID) {
        data.SESSION_ID = store.getters.sessionID
      }

      // For perl to accept the payload, we need to send it as form data
      // so create a form data object to wrap the data in
      const form = new FormData()
      Object.keys(data).forEach(key => form.append(key, data[key]))

      let config = {
        headers: {'Content-Type': 'multipart/form-data' }
      }
      if (opt) {
        config = {...config, ...opt}
      }

      return axios({
        url,
        method: 'post',
        data: form,
        header: {'Content-Type': 'multipart/form-data' }
      })

      // make the AJAX request
      return axios.post(url, data, config)
    }
  }
}