"use strict"

import { mount } from '@test'
import ArtefactMenuItem from '~/components/menu/ArtefactMenuItem.vue'
import Corpus from '../../../.utils/factories/Corpus-factory.js'

describe("ArtefactMenuItem", function() {
  let wrapper, vm
  const corpus = Corpus()
  const combination = corpus.combinations.get(corpus.combinations.keys()[0])
  const artefact = corpus.artefacts.get(combination.artefacts[0], combination.scroll_version_id)
  const image = corpus.imageReferences.get(combination.imageReferences[0])
  const push = sinon.spy()
  beforeEach(() => push.reset())
  
  describe("with all router changes", () => {
    beforeEach(() => {
      wrapper = mount(ArtefactMenuItem, {
        propsData: {
          artefact: artefact,
          scrollID: combination.scroll_id,
          imageID: image.image_catalog_id,
          scrollVersionID: combination.scroll_version_id,
          corpus: corpus,
        },
        mocks: { 
          $router: { push },
          $route: {
            params: { 
                artID: 10000001,
                scrollID: 10000001,
                scrollVersionID: 10000001,
                imageID: 10000001
            }
          }
        }
      })
      vm = wrapper.vm
    })
    
    it('responds properly to clicks', () => {
        wrapper.find('span.clickable-menu-item').trigger('click')

        // assertions 
        expect(push.firstCall.args[0].name).to.equal("workbenchAddress")
        expect(push.firstCall.args[0].params.scrollID).to.equal(combination.scroll_id)
        expect(push.firstCall.args[0].params.scrollVersionID).to.equal(combination.scroll_version_id)
        expect(push.firstCall.args[0].params.artID).to.equal(artefact.artefact_id)
        expect(push.firstCall.args[0].params.imageID).to.equal(image.image_catalog_id)
    })
  })
  
  describe("with artID, scrollID, and ScrollVersionID router changes", () => {
    beforeEach(() => {
      wrapper = mount(ArtefactMenuItem, {
        propsData: {
          artefact: artefact,
          scrollID: combination.scroll_id,
          imageID: image.image_catalog_id,
          scrollVersionID: combination.scroll_version_id,
          corpus: corpus,
        },
        mocks: { 
          $router: { push },
          $route: {
            params: { 
                artID: 10000001,
                scrollID: 10000001,
                scrollVersionID: 10000001,
                imageID: image.image_catalog_id
            }
          }
        }
      })
      vm = wrapper.vm
    })
    
    it('responds properly to clicks', () => {
        wrapper.find('span.clickable-menu-item').trigger('click')

        // assertions 
        expect(push.firstCall.args[0].name).to.equal("workbenchAddress")
        expect(push.firstCall.args[0].params.scrollID).to.equal(combination.scroll_id)
        expect(push.firstCall.args[0].params.scrollVersionID).to.equal(combination.scroll_version_id)
        expect(push.firstCall.args[0].params.artID).to.equal(artefact.artefact_id)
        expect(push.firstCall.args[0].params.imageID).to.equal(image.image_catalog_id)
    })
  })

  describe("with artID and ScrollVersionID router changes", () => {
    beforeEach(() => {
      wrapper = mount(ArtefactMenuItem, {
        propsData: {
          artefact: artefact,
          scrollID: combination.scroll_id,
          imageID: image.image_catalog_id,
          scrollVersionID: combination.scroll_version_id,
          corpus: corpus,
        },
        mocks: { 
          $router: { push },
          $route: {
            params: { 
                artID: 10000001,
                scrollID: combination.scroll_id,
                scrollVersionID: 10000001,
                imageID: image.image_catalog_id
            }
          }
        }
      })
      vm = wrapper.vm
    })
    
    it('responds properly to clicks', () => {
        wrapper.find('span.clickable-menu-item').trigger('click')

        // assertions 
        expect(push.firstCall.args[0].name).to.equal("workbenchAddress")
        expect(push.firstCall.args[0].params.scrollID).to.equal(combination.scroll_id)
        expect(push.firstCall.args[0].params.scrollVersionID).to.equal(combination.scroll_version_id)
        expect(push.firstCall.args[0].params.artID).to.equal(artefact.artefact_id)
        expect(push.firstCall.args[0].params.imageID).to.equal(image.image_catalog_id)
    })
  })

  describe("with artID router change", () => {
    beforeEach(() => {
      wrapper = mount(ArtefactMenuItem, {
        propsData: {
          artefact: artefact,
          scrollID: combination.scroll_id,
          imageID: image.image_catalog_id,
          scrollVersionID: combination.scroll_version_id,
          corpus: corpus,
        },
        mocks: { 
          $router: { push },
          $route: {
            params: { 
                artID: 10000001,
                scrollID: combination.scroll_id,
                scrollVersionID: combination.scroll_version_id,
                imageID: image.image_catalog_id
            }
          }
        }
      })
      vm = wrapper.vm
    })
    
    it('responds properly to clicks', () => {
        wrapper.find('span.clickable-menu-item').trigger('click')

        // assertions 
        expect(push.firstCall.args[0].name).to.equal("workbenchAddress")
        expect(push.firstCall.args[0].params.scrollID).to.equal(combination.scroll_id)
        expect(push.firstCall.args[0].params.scrollVersionID).to.equal(combination.scroll_version_id)
        expect(push.firstCall.args[0].params.artID).to.equal(artefact.artefact_id)
        expect(push.firstCall.args[0].params.imageID).to.equal(image.image_catalog_id)
    })
  })

  describe("with artID and imageID router changes", () => {
    beforeEach(() => {
      wrapper = mount(ArtefactMenuItem, {
        propsData: {
          artefact: artefact,
          scrollID: combination.scroll_id,
          imageID: image.image_catalog_id,
          scrollVersionID: combination.scroll_version_id,
          corpus: corpus,
        },
        mocks: { 
          $router: { push },
          $route: {
            params: { 
                artID: 10000001,
                scrollID: combination.scroll_id,
                scrollVersionID: combination.scroll_version_id,
                imageID: 10000001
            }
          }
        }
      })
      vm = wrapper.vm
    })
    
    it('responds properly to clicks', () => {
        wrapper.find('span.clickable-menu-item').trigger('click')

      // assertions 
      expect(push.firstCall.args[0].name).to.equal("workbenchAddress")
      expect(push.firstCall.args[0].params.scrollID).to.equal(combination.scroll_id)
      expect(push.firstCall.args[0].params.scrollVersionID).to.equal(combination.scroll_version_id)
      expect(push.firstCall.args[0].params.artID).to.equal(artefact.artefact_id)
      expect(push.firstCall.args[0].params.imageID).to.equal(image.image_catalog_id)
    })
  })

  describe("with no router changes", () => {
    beforeEach(() => {
      wrapper = mount(ArtefactMenuItem, {
        propsData: {
          artefact: artefact,
          scrollID: combination.scroll_id,
          imageID: image.image_catalog_id,
          scrollVersionID: combination.scroll_version_id,
          corpus: corpus,
        },
        mocks: { 
          $router: { push },
          $route: {
            params: { 
              artID: artefact.artefact_id,
              scrollID: combination.scroll_id,
              scrollVersionID: combination.scroll_version_id,
              imageID: image.image_catalog_id
            }
          }
        }
      })
      vm = wrapper.vm
    })
    
    it('responds properly to clicks', () => {
      wrapper.find('span.clickable-menu-item').trigger('click')

      // assertions 
      expect(push).to.have.callCount(0)
    })

    it('can start editing a name', () => {
      vm.startNameChange()

      // assertions 
      expect(vm.nameInput).to.equal(artefact.name)
    })

    it('can change a name', () => {
      const newName = 'new name'
      const oldName = artefact.name
      vm.startNameChange()
      vm.nameInput = newName
      vm.setName()

      // assertions 
      expect(vm.nameInput).to.equal(newName)
      // expect the write to fail without AJAX completion
      expect(artefact.name).to.equal(oldName)
    })

    it('does nothing when changing to undefined name', () => {
      vm.nameInput = undefined
      vm.setName()

      // assertions 
      expect(vm.nameInput).to.equal(undefined)
    })

    it('can delete itself', () => {
      const oldName = artefact.name
      vm.deleteArtefact()
      
      // expect the write to fail without AJAX completion
      expect(artefact.name).to.equal(oldName)
    })
  })
})