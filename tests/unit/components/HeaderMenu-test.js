import { mount } from '@test'
import HeaderMenu from '~/components/HeaderMenu.vue'

describe('HeaderMenu', () => {
  let wrapper, vm
  const push = sinon.spy()
  beforeEach(() => {
    wrapper = mount(HeaderMenu, {
      propsData: {
        corpus: {}
      },
      mocks: {
        $router: { push },
        $route: {
          params: {
            scrollVersionID: 1,
          }
        }
      }
    })
    vm = wrapper.vm
  })
  describe('logout', () => {
    it('should clear all user values on logout and redirect', () => {
      sinon.spy(vm.$store, 'commit')

      // trigger logout action
      vm.onLogout()

      // expect that the logout was committed
      expect(vm.$store.commit.firstCall.args[0]).to.equal('logout')

      // expect a routing event
      expect(vm.$router.push.called).to.equal(true)
    })
  })

  describe('router watcher', () => {
    it('should respond to router changes', done => {
      wrapper.setData({$route: {params: {scrollVersionID: 2}}})
      vm.$nextTick(() => {
        expect(vm.scrollVersionID).to.equal(2)
        done()
      })
    })
  })
})
