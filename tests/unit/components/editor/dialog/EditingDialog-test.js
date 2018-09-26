import { mount, factory } from '@test'

import Tab from '~/components/editor/dialog/Tab.vue'
import EditingDialog from '~/components/editor/dialog/EditingDialog.vue'

describe('EditingDialog', () => {
  let wrapper, vm
  beforeEach(() => {
    const col = factory.column({ signs: 15 })
    const line = col.get(0)
    wrapper = mount(EditingDialog, {
      propsData: {
        line,
        sign: line.get(0),
        dialogVisible: true,
      },
    })
    vm = wrapper.vm
  })

  it('should contain a number of tabbed panes', () => {
    expect(wrapper.findAll(Tab).length).to.equal(4)
  })

  it('should change signs on click', () => {
    const spy = sinon.spy(vm, 'changeSign')

    // Vue-test-utils will find the _first_ element
    // that matches and click on that. This should
    // correspond to the first sign in the line.
    wrapper.find('.line-sign').trigger('click')

    // Detect that arguments passed into `changeSign`
    // and confirm that indeed the argument passed was
    // the first sign in the line.
    expect(spy.getCall(0).args[0]).to.equal(vm.line.get(0))
  })
})
