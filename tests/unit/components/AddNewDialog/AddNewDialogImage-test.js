'use strict'

import { mount } from '@test'
import AddNewDialogImage from '~/components/AddNewDialog/AddNewDialogImage.vue'
import Corpus from '../../../.utils/factories/Corpus-factory.js'

describe('AddNewDialogImage', function() {
  let wrapper, vm
  const corpus = new Corpus()
  const combination = corpus.combinations.get(corpus.combinations.keys()[0])
  const image = corpus.imageReferences.get(combination.imageReferences[0])
  const artefact = image.artefacts[0]

  beforeEach(() => {
    wrapper = mount(AddNewDialogImage, {
      propsData: {
        corpus: corpus,
        artefact: artefact,
        scrollVersionID: combination.scroll_version_id,
        imageReference: image.image_catalog_id,
      },
    })
    vm = wrapper.vm
  })

  it('has a proper initial state', () => {
    expect(vm.corpus).to.deep.equal(corpus)
    expect(vm.artefact).to.equal(artefact)
    expect(vm.scrollVersionID).to.equal(combination.scroll_version_id)
    expect(vm.imageReference).to.equal(image.image_catalog_id)
  })

  it('can toggle a mask', () => {
    expect(vm.clippingOn).to.equal(false)
    vm.toggleMask()
    expect(vm.clippingOn).to.equal(true)
    vm.toggleMask()
    expect(vm.clippingOn).to.equal(false)
  })

  it('can change the zoom', () => {
    const newZoomValue = 0.65
    expect(vm.zoom).to.equal(1)
    vm.changeZoom(newZoomValue)
    expect(vm.zoom).to.equal(newZoomValue)
  })

  it('can set opacity', () => {
    const imageIndex = Object.keys(vm.imageSettings)[0]
    const newOpacityValue = 0.76
    expect(vm.imageSettings[imageIndex].opacity).to.equal(1.0)
    vm.setOpacity(imageIndex, newOpacityValue)
    expect(vm.imageSettings[imageIndex].opacity).to.equal(newOpacityValue)
  })

  it('can toggle visibility', () => {
    const imageIndex = Object.keys(vm.imageSettings)[0]
    const initialVisibility = vm.imageSettings[imageIndex].visible
    expect(vm.imageSettings[imageIndex].visible).to.equal(initialVisibility)
    vm.toggleVisible(imageIndex)
    expect(vm.imageSettings[imageIndex].visible).to.equal(!initialVisibility)
    vm.toggleVisible(imageIndex)
    expect(vm.imageSettings[imageIndex].visible).to.equal(initialVisibility)
  })
})
