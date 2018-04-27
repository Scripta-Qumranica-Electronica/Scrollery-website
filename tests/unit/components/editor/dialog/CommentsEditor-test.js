import { mount } from '@test'
import CommentsEditor from '~/components/editor/dialog/CommentsEditor.vue'

describe('CommentsEditor', () => {

  let wrapper, vm
  beforeEach(() => {
    wrapper = mount(CommentsEditor)
    vm = wrapper.vm
  })

  it('should mount with a quill editor', () => {
    expect(vm.quill).not.to.equal(null)
  })

})