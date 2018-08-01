export default function(Vuex, sessionID = '') {
  return new Vuex.Store({
    state: {
      sessionID,
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
      lockedScrolls: state => state.lockedScrolls,
      isScrollLocked: state => scroll_version_id => {
        return Boolean(state.lockedScrolls[scroll_version_id])
      },
      attributes: state => state.signAttributeList,
      cannonicalAttribute: state => name => state.signAttributeList[name],
    },
    mutations: {
      logout(state) {
        state.sessionID = ''
        state.userID = -1
        state.username = ''
        window.localStorage.removeItem('sqe-session')
        window.localStorage.removeItem('name')
        // window.localStorage.removeItem('language')
      },
      setSessionID(state, sessionID) {
        window.localStorage.setItem('sqe-session', sessionID)
        state.sessionID = sessionID
      },
      setUserID(state, userID) {
        state.userID = userID
      },
      setUsername(state, name) {
        name === '' && state.userID === -1
          ? window.localStorage.removeItem('name')
          : window.localStorage.setItem('name', JSON.stringify({ [state.userID]: name }))
        state.username = name
      },
      setLanguage(state, language) {
        window.localStorage.setItem('language', language)
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
              attribute_name: attr.name,
              attribute_id: attr.attribute_id,
              attribute_description: attr.attribute_description || '',
              values: [],
            }
          }
          const values = state.signAttributeList[attr.name].values

          // ensure no duplicate attribute_value_ids sneak by
          if (!values.find(val => attr.attribute_value_id === val.attribute_value_id)) {
            values.push({
              attribute_value_id: attr.attribute_value_id,
              attribute_value_description: attr.attribute_value_description,
              string_value: attr.string_value,
              type: attr.type,
            })
          }
        })
      },
    },
  })
}
