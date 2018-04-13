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

  // create args
  const args = {
    ...{
      store,
      localVue,
    },
    ...opt,
  }

  return shallow(Component, args)
}
