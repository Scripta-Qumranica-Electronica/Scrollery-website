import { mount } from '@test'
import AppBody from '~/components/AppBody.vue'

describe('AppBody', () => {
  let wrapper, vm
  beforeEach(() => {
    wrapper = mount(AppBody, {
      // provide stubs for all children
      stubs: Object.keys(AppBody.components),
    })
    vm = wrapper.vm
  })

  // simply change component state which tracks mouse-over
  // ... no need to simpulate that tracking the mouse events
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
})
