export default {
  install(Vue, opt) {
    Vue.prototype.$i18n = {
      str(key, args) {
        return key
      },
      num(key, args) {
        return key
      }
    }
  }
}
