import makeStore from '~/store/make.js'
import { shallow, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

export default Component => {
  const localVue = createLocalVue()
  localVue.use(Vuex)
  const store = makeStore(Vuex, []);

  return shallow(Component, {
    store, localVue
  })
}