"use strict"

import { mount } from '@test'
import AddNewArtefactMenu from '~/components/AddNewDialog/AddNewArtefactMenu.vue'
import Corpus from '../../../.utils/factories/Corpus-factory.js'

describe("AddNewArtefactMenu", function() {
  let wrapper, vm
  const corpus = Corpus()
  const combination = corpus.combinations.get(corpus.combinations.keys()[0])
  const artefact = corpus.artefacts.get(combination.artefacts[0], combination.scroll_version_id)
  const image = corpus.imageReferences.get(combination.imageReferences[0])
  const push = sinon.spy()
  beforeEach(() => push.reset())
  
  describe('Both image reference and scroll version', () => {
    beforeEach(() => {
      wrapper = mount(AddNewArtefactMenu, {
        propsData: {
          selectedImageReference: image.image_catalog_id,
          selectedCombination: combination.scroll_version_id,
          corpus: corpus,
        },
      })
      vm = wrapper.vm
    })
    it('selects an artefact', () => {
        vm.setArtefact(vm.artefactReferences[0])

        // assertions 
        expect(vm.selectedArtefact).to.equal(vm.artefactReferences[0])
    })
  })

  describe('No selected image reference', () => {
    beforeEach(() => {
      wrapper = mount(AddNewArtefactMenu, {
        propsData: {
          selectedImageReference: undefined,
          selectedCombination: combination.scroll_version_id,
          corpus: corpus,
        },
      })
      vm = wrapper.vm
    })
    
    it('responds properly to clicks', () => {
      vm.setArtefact(vm.artefactReferences[0])

      // assertions 
      expect(vm.selectedArtefact).to.equal(vm.artefactReferences[0])
    })
  })

  describe('No selected image reference or scroll version', () => {
    beforeEach(() => {
      wrapper = mount(AddNewArtefactMenu, {
        propsData: {
          selectedImageReference: undefined,
          selectedCombination: undefined,
          corpus: corpus,
        },
      })
      vm = wrapper.vm
    })
    
    it('has nothing to display', () => {
      expect(vm.artefactReferences.length).to.equal(0)
    })
  })
})