import { mount } from '@test'
import HeaderMenu from '~/components/HeaderMenu.vue'

describe('HeaderMenu', () => {
  let wrapper, vm
  beforeEach(() => {
    wrapper = mount(HeaderMenu)
    vm = wrapper.vm
  })
  describe('logout', () => {
    it('should clear all user values on logout and redirect', () => {
      sinon.spy(vm.$store, 'commit')
      vm.$router = {
        push: sinon.spy(),
      }

      // trigger logout action
      vm.onLogout()

      // expect that the logout was committed
      expect(vm.$store.commit.firstCall.args[0]).to.equal('logout')

      // expect a routing event
      expect(vm.$router.push.called).to.equal(true)
    })
  })
})
