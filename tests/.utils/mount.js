import makeStore from '~/store/make.js'
import i18n from '~/plugins/i18n'
import { shallow, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

export default (Component, opt = {}) => {
  const localVue = createLocalVue()

  // Vuex
  localVue.use(Vuex)
  const store = makeStore(Vuex, [])

  // i18n
  localVue.use(i18n, { store })

  const window = { localStorage: storageMock() }

  // create args
  const args = {
    ...{
      store,
      localVue,
      window,
    },
    ...opt,
  }

  return shallow(Component, args)
}

/**
 * This is based on https://stackoverflow.com/questions/11485420/how-to-mock-localstorage-in-javascript-unit-tests
 */
function storageMock() {
  var storage = {}

  return {
    setItem: function(key, value) {
      storage[key] = value || ''
    },
    getItem: function(key) {
      return key in storage ? storage[key] : null
    },
    removeItem: function(key) {
      delete storage[key]
    },
    get length() {
      return Object.keys(storage).length
    },
    key: function(i) {
      var keys = Object.keys(storage)
      return keys[i] || null
    },
  }
}
