import axios from 'axios'

export default {
  install(Vue) {
    Vue.prototype.$post = function(url, data, opt) {

      // For perl to accept the payload, we need to send it as form data
      // so create a form data object to wrap the data in
      const form = new FormData()
      Object.keys(data).forEach(key => form.append(key, data[key]))

      let config = {
        method: 'post',
        url,
        data: form,
        config: { headers: {'Content-Type': 'multipart/form-data' }}
      }
      if (opt) {
        config = {...config, ...opt}
      }

      // make the AJAX request
      return axios(config)
    }
  }
}