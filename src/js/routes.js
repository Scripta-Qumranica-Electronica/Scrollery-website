import Login from '~/components/Login.vue'

export default [
  { 
    path: '/',
    redirect: {
      name: 'login'
    }
  },
  { 
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/workbench',
    name: 'workbench',
    component: () => {
      return new Promise(resolve => require(['~/components/Workbench.vue'], resolve))
    }
  },
  {
    path: '/workbench/:scrollID/:scrollVersionID',
    name: 'workbenchScrollVersion',
    component: () => {
      return new Promise(resolve => require(['~/components/Workbench.vue'], resolve))
    }
  },
  {
    path: '/workbench/:scrollID/:scrollVersionID/:selectionType/:id',
    name: 'workbenchScrollVersionTypeId',
    component: () => {
      return new Promise(resolve => require(['~/components/Workbench.vue'], resolve))
    }
  },
  {
    path: '/workbench/:scrollID/:scrollVersionID/:selectionType/:plate/:fragment',
    name: 'workbenchScrollVersionPlateFragment',
    component: () => {
      return new Promise(resolve => require(['~/components/Workbench.vue'], resolve))
    }
  },
]