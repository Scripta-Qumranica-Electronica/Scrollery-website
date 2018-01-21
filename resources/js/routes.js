import App from './App.vue'

export default [
  { 
    path: '/',
    component: App
  },
  {
    path: '/workbench',
    name: 'workbench',
    component: () => {
      return new Promise(resolve => require(['./LegacyWorkbench.vue'], resolve))
    }
  }
]