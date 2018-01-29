// Styles - these will be extracted and loaded above the fold
import '../sass/index.scss'
import '@/node_modules/imperavi-kube/dist/css/kube.min.css'

import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import i18n from './plugins/i18n'
import ajax from './plugins/ajax'
import routes from './routes'
import makeStore from './store/make'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

// Router
Vue.use(VueRouter)
const router = new VueRouter({ routes })

// Store
Vue.use(Vuex)
const store = makeStore(Vuex)

// Localization
Vue.use(i18n, { store })

// AJAX
Vue.use(ajax, { store })

// Element-ui
Vue.use(ElementUI)

// Turn on the lights
const app = new Vue({
  router,
  store
}).$mount('#app')

