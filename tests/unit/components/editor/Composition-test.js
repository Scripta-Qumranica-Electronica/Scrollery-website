import { mount } from '@test'
import CompositionComponent from '~/components/editor/Composition.vue'
import Composition from '~/models/Composition.js'


describe('CompositionComponent', () => {

  let vm, wrapper
  beforeEach(() => {
    let wrapper = mount(CompositionComponent)
    vm = wrapper.vm
  })

  it('should contain a composition model by default', () => {
    expect(vm.text instanceof Composition).to.equal(true)
  })

})