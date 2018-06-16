export default function(Vuex, plugins) {
  return new Vuex.Store({
    state: {
      sessionID: '',
      userID: -1,
      username: '',
      language: 'en',
      languages: {},
      working: 0,
      lockedScrolls: {},
      signAttributeList: {},
    },
    getters: {
      sessionID: state => state.sessionID,
      userID: state => state.userID,
      username: state => state.username,
      language: state => state.language,
      languages: state => state.languages,
      working: state => state.working,
      isScrollLocked: state => scroll_version_id => {
        return Boolean(state.lockedScrolls[scroll_version_id])
      },
      attributes: state => state.signAttributeList,
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
      setLanguage(state, language) {
        state.language = language
      },
      loadLanguage(state, { key, data }) {
        state.languages[key] = data
      },
      resetWorking(state) {
        state.working = 0
      },
      addWorking(state) {
        state.working += 1
      },
      delWorking(state) {
        state.working = state.working - 1 >= 0 ? state.working - 1 : 0
      },
      setLockedScrolls(state, list) {
        state.lockedScrolls = list
      },
      setSignAttributeList(state, rawList) {
        rawList.forEach(attr => {
          if (!state.signAttributeList[attr.name]) {
            state.signAttributeList[attr.name] = {
              name: attr.name,
              attribute_id: attr.attribute_id,
              attribute_description: attr.attribute_description || '',
              values: [],
            }
          }
          state.signAttributeList[attr.name].values.push({
            attribute_value_id: attr.attribute_value_id,
            attribute_value_description: attr.attribute_value_description,
            string_value: attr.string_value,
            type: attr.type,
          })
        })
      },
    },
    plugins,
  })
}
