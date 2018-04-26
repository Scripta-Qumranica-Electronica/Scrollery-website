import { mount } from '@test'
import AppBody from '~/components/AppBody.vue'

describe('AppBody', () => {
  let wrapper, vm
  const push = sinon.spy()

  beforeEach(() => {
    wrapper = mount(AppBody, {
      // provide stubs for all children
      stubs: Object.keys(AppBody.components),
      mocks: { 
        $router: { push },
        $route: {
          params: { 
            scrollID: 20,
            scrollVersionID: 324,
            colID: 123,
            imageID:432,
            artID:657
          }
        },
      }
    })
    vm = wrapper.vm
  })

  // simply change component state which tracks mouse-over
  // ... no need to simulate that tracking the mouse events
  // is working since that would be more of a test of Vue
  describe('menu state', () => {
    it('should keep the menu open when clicking the keep-open icon', () => {
      vm.keepMenuOpen = true
      expect(vm.menuOpen).to.equal(true)
    })

    it('should keep the menu open during hover', () => {
      vm.mouseOver = true
      expect(vm.menuOpen).to.equal(true)
    })
  })

  describe('router interaction', () => {
    it('should cycle the router', () => {
      vm.resetRouter()
      expect(push.called).to.equal(true)
      expect(vm.$route.params.scrollID).to.equal(20)
    })
  })
})
