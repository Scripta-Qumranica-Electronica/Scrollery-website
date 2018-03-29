import { mount } from '@test'
import Sign from '~/components/editor/Sign.vue'
import SignModel from '~/models/Sign.js'
import editorStore from '~/components/editor/EditorStore.js'

export default (props = {}) => mount(Sign, {
  propsData: Object.assign({
    showReconstructedSigns: true,
    state: editorStore(),
    sign: new SignModel({
      id: 1
    }, new Map()),
    focusedSignId: -1
  }, props)
})