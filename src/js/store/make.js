export default function(Vuex, plugins) {
  return new Vuex.Store({
    state: {
      sessionID: '',
      userID: -1,
      username: '',
      password: '',
      language: 'en',
      languages: {},
      working: 0,
    },
    getters: {
      sessionID: state => state.sessionID,
      userID: state => state.userID,
      username: state => state.username,
      password: state => state.password,
      language: state => state.language,
      languages: state => state.languages,
      scrollID: state => state.scrollID,
      scrollVersionID: state => state.scrollVersionID,
      colID: state => state.colID,
      working: state => state.working,
    },
    mutations: {
      logout(state) {
        state.sessionID = ''
        state.userID = -1
        state.username = ''
      },
      setSessionID(state, sessionID) {
        state.sessionID = sessionID
      },
      setUserID(state, userID) {
        state.userID = userID
      },
      setUsername(state, name) {
        state.username = name
      },
      setPassword(state, passwd) {
        state.password = passwd
      },
      setLanguage(state, language) {
        state.language = language
      },
      loadLanguage(state, { key, data }) {
        state.languages[key] = data
      },
      addWorking(state) {
        state.working += 1
      },
      delWorking(state) {
        state.working = state.working - 1 >= 0 ? state.working - 1 : 0
      },
    },
    plugins,
  })
}