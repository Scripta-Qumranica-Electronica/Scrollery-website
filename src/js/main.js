// Styles - these will be extracted and loaded above the fold
import '../sass/index.scss'

import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import VuexPersist from 'vuex-persist'
import i18n from './plugins/i18n'
import ajax from './plugins/ajax'
import routes from './routes'
import makeStore from './store/make'
import ElementUI from 'element-ui'
import ElementLocale from 'element-ui/lib/locale'

import 'element-ui/lib/theme-chalk/index.css'

// Router
Vue.use(VueRouter)
const router = new VueRouter({ routes })

// Store
const vuexLocalStorage = new VuexPersist({
  key: 'sqe',
  storage: window.localStorage,
})
Vue.use(Vuex)
const store = makeStore(Vuex, [vuexLocalStorage.plugin])

// SQE Localization
Vue.use(i18n, { store })

// AJAX
Vue.use(ajax, { store })

// Element-ui
ElementLocale.use(store.getters.language)
Vue.use(ElementUI)

// load up the localizations
new Vue({
  router,
  store,
}).$mount('#app')
