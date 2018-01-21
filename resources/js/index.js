import Vue from 'vue'
import VueRouter from 'vue-router'
import i18n from './i18n'
import routes from './routes'

import '@/node_modules/imperavi-kube/dist/css/kube.min.css'

// Router
Vue.use(VueRouter)
const router = new VueRouter({ routes })

// Localization
Vue.use(i18n)

const app = new Vue({
  router
}).$mount('#app')

