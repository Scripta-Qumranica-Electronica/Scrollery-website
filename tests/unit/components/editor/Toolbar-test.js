import { mount } from '@test'
import Toolbar from '~/components/editor/Toolbar.vue'
import editorStore from '~/components/editor/EditorStore.js'

/**
 * Construct Toolbars for testing
 * 
 * @param {object} props additional props
 * 
 * @return {VueTestWrapper} the vue-test-utils wrapper class
 */
const factory = () => mount(Toolbar, {
  propsData: {
    state: editorStore({
      str: key => key
    }),
  }
})

describe('Toolbar.vue', () => {

  let wrapper, vm
  beforeEach(() => {
    wrapper = factory();
    vm = wrapper.vm
  })

  describe('show/hide reconstructed text', () => {
    
    it('should toggle editor state to show/hide reconstructed state', () => {
      let initial = vm.state.getters.showReconstructedText

      vm.toggleReconstructedText()
      expect(vm.state.getters.showReconstructedText).to.equal(!initial)

      vm.toggleReconstructedText()
      expect(vm.state.getters.showReconstructedText).to.equal(initial)
    })
  })

  describe('fonts', () => {

    it('should not accept unknown fonts but not throw errors', () => {
      let initial = vm.state.getters.font

      vm.onFontChange('DOES_NOT_EXIST')
      expect(vm.state.getters.font).to.equal(initial)
    })

    it('should change known fonts', () => {
      let initial = vm.state.getters.font
      let fonts = vm.state.getters.fonts

      // fonts is an object, grab the first key off of it.
      let fontName = Object.keys(fonts)[1];

      vm.onFontChange(fontName)
      expect(vm.state.getters.font).to.equal(fonts[fontName])
    })

  })
})