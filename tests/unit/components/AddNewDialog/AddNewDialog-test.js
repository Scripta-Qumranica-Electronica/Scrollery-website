'use strict'

import { mount } from '@test'
import AddNewDialog from '~/components/AddNewDialog/AddNewDialog.vue'
import Corpus from '../../../.utils/factories/Corpus-factory.js'

/**
 * TODO: I can't get full testing done here until I
 * set up mocking for the corpus populate functionality.
 */
describe('AddNewDialog', function() {
  let wrapper, vm
  const corpus = new Corpus()
  const combination = corpus.combinations.get(corpus.combinations.keys()[0])
  const image = corpus.imageReferences.get(combination.imageReferences[0])
  const artefact = image.artefacts[0]

  beforeEach(() => {
    wrapper = mount(AddNewDialog, {
      propsData: {
        corpus: corpus,
        addType: 'artefacts',
        currentScrollVersionID: combination.scroll_version_id,
      },
    })
    vm = wrapper.vm
  })

  it('has a proper initial state', () => {
    expect(vm.corpus).to.deep.equal(corpus)
    expect(vm.addType).to.equal('artefacts')
    expect(vm.currentScrollVersionID).to.equal(combination.scroll_version_id)
  })

  it('can set a combination', () => {
    vm.setCombination(combination.scroll_version_id)
    expect(vm.selectedCombination).to.equal(combination.scroll_version_id)
    expect(vm.selectedImageReference).to.equal(undefined)
  })

  it('can set an image', () => {
    vm.setCombination(combination.scroll_version_id)
    vm.setImageReference(image.image_catalog_id)
    // expect(vm.selectedCombination).to.equal(combination.scroll_version_id)
    // expect(vm.selectedImageReference).to.equal(image.image_catalog_id)
    expect(vm.selectedArtefact).to.equal(undefined)

    vm.setCombination(undefined)
    vm.setImageReference(image.image_catalog_id)
    // expect(vm.selectedCombination).to.equal(undefined)
    // expect(vm.selectedImageReference).to.equal(image.image_catalog_id)
    expect(vm.selectedArtefact).to.equal(undefined)
  })

  it('can set an artefact', () => {
    vm.setCombination(combination.scroll_version_id)
    vm.setArtefact(artefact)
    // expect(vm.selectedCombination).to.equal(combination.scroll_version_id)
    // expect(vm.selectedImageReference).to.equal(image.image_catalog_id)
    // expect(vm.selectedArtefact).to.equal(undefined)
  })

  it('can prepare to create a new artefact', () => {
    vm.createNewArtefact()
    // expect(vm.selectedCombination).to.equal(combination.scroll_version_id)
    // expect(vm.selectedImageReference).to.equal(image.image_catalog_id)
    expect(vm.selectedArtefact).to.equal(undefined)
  })

  it('can commit a new artefact', () => {
    vm.selectedCombination = combination.scroll_version_id
    vm.selectedArtefact = artefact
    vm.selectedImageReference = combination.imageReferences[0]
    vm.commitNewArtefact()

    vm.selectedCombination = combination.scroll_version_id
    vm.selectedArtefact = artefact
    vm.selectedImageReference = undefined
    vm.commitNewArtefact()

    vm.selectedCombination = combination.scroll_version_id
    vm.selectedArtefact = undefined
    vm.selectedImageReference = combination.imageReferences[0]
    vm.commitNewArtefact()

    vm.selectedCombination = combination.scroll_version_id
    vm.selectedArtefact = undefined
    vm.selectedImageReference = undefined
    vm.commitNewArtefact()
    // expect(vm.selectedCombination).to.equal(combination.scroll_version_id)
    // expect(vm.selectedImageReference).to.equal(image.image_catalog_id)
  })
})
