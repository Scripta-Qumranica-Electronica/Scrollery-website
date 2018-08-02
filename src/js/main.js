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
import locale from 'element-ui/lib/locale'

import 'element-ui/lib/theme-chalk/index.css'

// Router
Vue.use(VueRouter)
const router = new VueRouter({ routes })

// Store
Vue.use(Vuex)
const store = makeStore(
  Vuex,
  window.localStorage ? window.localStorage.getItem('sqe-session') || '' : ''
)

// Localization
Vue.use(i18n, { store })

// element localization
locale.use('en')

// AJAX
Vue.use(ajax, { store })

// Element-ui
Vue.use(ElementUI)

// Turn on the lights
const app = new Vue({
  router,
  store
}).$mount('#app')
