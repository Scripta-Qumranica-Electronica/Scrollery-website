import i18nPlugin from '~/plugins/i18n.js'
import vuex from 'vuex'
import makeStore from '~/store/make.js'

describe('i18n', () => {
  let i18n, store
  beforeEach(() => {
    const mockVue = function() {}
    store = makeStore(vuex, [])

    i18nPlugin.install(mockVue, { store })
    i18n = mockVue.prototype.$i18n
  })

  it('should use request the language set', () => {
    const test = 'i18n resolved'
    const languageKey = 'hb'
    store.commit('loadLanguage', { key: languageKey, data: { test } })

    // expect that the key is returned since the language isn't known
    expect(i18n.str('test')).to.equal('test')

    store.commit('setLanguage', languageKey)

    // now the string should resolve
    expect(i18n.str('test')).to.equal(test)
  })

  it('should fallback to english', () => {
    const testEn = 'i18n - en - resolved'
    const testHb = 'i18n - hb - resolved'

    // seed language for english and hebrew, but with
    // different data sets
    store.commit('loadLanguage', { key: 'en', data: { test: testEn } })
    store.commit('loadLanguage', { key: 'hb', data: { testHbKey: testHb } })

    store.commit('setLanguage', 'hb')

    // expect that it will fall back to english dataset in this case
    // since the hebrew dataset doesn't contain the key 'test'
    expect(i18n.str('test')).to.equal(testEn)

    // expect that it will NOT fall back to hebrew since the key is known
    expect(i18n.str('testHbKey')).to.equal(testHb)
  })

  it('should interpolate variables', () => {
    store.commit('loadLanguage', { key: 'en', data: { test: ':name: :age:' } })
    store.commit('setLanguage', 'en')

    expect(i18n.str('test', { name: 'test', age: 1 })).to.equal('test 1')
  })
})
