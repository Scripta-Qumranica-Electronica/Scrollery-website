export default {
  install(Vue, { store }) {
    const {
      language,
      languages
    } = store.getters

    Vue.prototype.$i18n = {

      /**
       * @param {string}      key  Lookup key for language file 
       * @param {object|null} args named arguments for the 
       */
      str(key, args = {}) {
        let str;
        let data = languages[language]
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
        const re = /\:(\w+)(\=\w*)?:/
        let matches = null;
        while ((matches = re.exec(str)) !== null) {
          str.replace(matches[0], args[matches[1]] || matches[2] || matches[1])
        }

        // finish
        return str
      },
      num(key, args) {
        return key
      },
      load() {
        return new Promise(resolve => {
          switch (language) {
            case 'hb':
              require(['~/lang/en.js', '~/lang/hb.js'], (en, hb) => {
                store.commit("loadLanguage", {key: 'en', data: en})
                store.commit("loadLanguage", {key: 'hb', data: hb})
              })
              break;
            case 'de':
              require(['~/lang/en.js', '~/lang/de'], (en, de) => {
                store.commit("loadLanguage", {key: 'en', data: en})
                store.commit("loadLanguage", {key: 'de', data: de})
              })
              break
            default:
              require(['~/lang/en.js'], en => store.commit("loadLanguage", {key: 'en', data: en}))
          }
        })
      }
    }
  }
}
