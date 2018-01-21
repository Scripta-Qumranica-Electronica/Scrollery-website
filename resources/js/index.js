import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import i18n from './i18n'
import ajax from './ajax'
import routes from './routes'
import makeStore from './store'

//import '@/node_modules/imperavi-kube/dist/css/kube.min.css'

// Router
Vue.use(VueRouter)
const router = new VueRouter({ routes })

// Store
Vue.use(Vuex)
const store = makeStore(Vuex)

// Localization
Vue.use(i18n)

// AJAX
Vue.use(ajax)

const app = new Vue({
  router,
  store
}).$mount('#app')

