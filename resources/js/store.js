export default function(Vuex) {
  return new Vuex.Store({
    state: {
      sessionID: '',
      userID: -1,
      username: ''
    },
    getters: {
      sessionID: state => state.sessionID,
      userID: state => state.userID,
      username: state => state.username
    },
    mutations: {
      setSessionID(state, sessionID) {
        state.sessionID = sessionID
      },
      setUserID(state, userID) {
        state.userID = userID
      },
      setUsername(state, name) {
        state.username = name
      }
    }
  })
}