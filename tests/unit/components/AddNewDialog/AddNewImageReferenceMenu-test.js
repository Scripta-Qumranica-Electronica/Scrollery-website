"use strict"

import { mount } from '@test'
import AddNewImageReferenceMenu from '~/components/AddNewDialog/AddNewImageReferenceMenu.vue'
import Corpus from '../../../.utils/factories/Corpus-factory.js'

describe("AddNewImageReferenceMenu", function() {
  let wrapper, vm
  const corpus = Corpus()
  const combination = corpus.combinations.get(corpus.combinations.keys()[0]) 
  const image = corpus.imageReferences.get(combination.imageReferences[0])
  const push = sinon.spy()
  beforeEach(() => push.reset())
  
  describe('display of images with image reference', () => {
    beforeEach(() => {
      wrapper = mount(AddNewImageReferenceMenu, {
        propsData: {
          selectedCombination: combination.scroll_version_id,
          selectedImageReference: image.image_catalog_id,
          corpus: corpus,
        },
      })
      vm = wrapper.vm
    })
    it('selects an image', () => {
      vm.setImageReference(vm.imageReferences[0])

      // assertions 
      expect(vm.selectedImageReference).to.equal(vm.imageReferences[0])
      expect(wrapper.emitted().setImageReference[0][0]).to.equal(vm.imageReferences[0])
    })

    it('hides/shows images', () => {
      wrapper.find('div.hide-show-images').trigger('click')
      expect(vm.show).to.equal(false)
    })
  })

  describe('display of images without selected combination', () => {
    beforeEach(() => {
      wrapper = mount(AddNewImageReferenceMenu, {
        propsData: {
          selectedCombination: undefined,
          selectedImageReference: undefined,
          corpus: corpus,
        },
      })
      vm = wrapper.vm
    })

    it('hides/shows images', () => {
      wrapper.find('div.hide-show-images').trigger('click')
      expect(vm.show).to.equal(false)
    })
  })
})