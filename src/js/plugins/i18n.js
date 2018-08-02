export default {
  install(Vue, { store }) {
    const { languages } = store.getters

    Vue.prototype.$i18n = {
      /**
       * @param {string}      key  Lookup key for language file
       * @param {object|null} args named arguments for the
       */
      str(key, args = {}) {
        let str
        let data = languages[store.getters.language]
        if (!data || !data[key]) {
          // fallback to English
          data = languages['en']
        }

        // Safeguard to ensure data is present
        if (!data || !data[key]) {
          return key
        }

        // set str
        str = data[key]

        // process vars
        const re = /(\:(\w+)(\=[^\:]+)?\:)/
        let matches
        while ((matches = re.exec(str)) !== null) {
          str = str.replace(matches[0], args[matches[2]] || matches[3] || matches[2])
        }

        // finish
        return str
      },

      load() {
        /* istanbul ignore next */
        return new Promise(resolve => {
          switch (store.getters.language) {
            case 'hb':
              require(['~/lang/en.js', '~/lang/hb.js'], (en, hb) => {
                store.commit('loadLanguage', { key: 'en', data: en })
                store.commit('loadLanguage', { key: 'hb', data: hb })
                resolve()
              })
              break
            case 'de':
              require(['~/lang/en.js', '~/lang/de'], (en, de) => {
                store.commit('loadLanguage', { key: 'en', data: en })
                store.commit('loadLanguage', { key: 'de', data: de })
                resolve()
              })
              break
            default:
              require(['~/lang/en.js'], en => {
                store.commit('loadLanguage', { key: 'en', data: en })
                resolve()
              })
          }
        })
      }
    }
  }
}
