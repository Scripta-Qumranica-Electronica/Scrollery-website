import { mount } from '@test'
import CommentsEditor from '~/components/editor/dialog/CommentsEditor.vue'

describe('CommentsEditor', () => {
  let wrapper, vm
  const initialText = 'This is a test comment.'
  beforeEach(() => {
    wrapper = mount(CommentsEditor, {
      propsData: {
        initialText: initialText,
      },
    })
    vm = wrapper.vm
  })

  it('should mount with a quill editor', () => {
    expect(vm.quill).not.to.equal(null)
  })

  it('should have the proper initial text', () => {
    expect(vm.quill.getText(0)).to.equal(initialText + '\n')
  })

  it('should update its text', () => {
    const updatedText = 'Some updated comment text.'
    wrapper.setProps({ initialText: updatedText })
    expect(vm.quill.getText(0)).to.equal(updatedText + '\n')
  })

  it('should properly handle no change to text', () => {
    wrapper.setProps({ initialText: initialText })
    expect(vm.quill.getText(0)).to.equal(initialText + '\n')
  })

  it('should emit a commit text event', () => {
    vm.commitComment()
    expect(wrapper.emitted().addComment[0][0]).to.equal(initialText + '\n')
  })

  it('should emit a delete text event', () => {
    vm.deleteComment()
    expect(wrapper.emitted().deleteComment[0]).to.deep.equal([])
  })
})
