import App from '~/components/App.vue'

export default [
  { 
    path: '/',
    component: App
  },
  {
    path: '/workbench',
    name: 'workbench',
    component: () => {
      return new Promise(resolve => require(['~/components/LegacyWorkbench.vue'], resolve))
    }
  }
]