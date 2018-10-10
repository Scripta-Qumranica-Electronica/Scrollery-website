'use strict'

import { mount } from '@test'
import ImageMenuItem from '~/components/menu/ImageMenuItem.vue'
import Corpus from '../../../.utils/factories/Corpus-factory.js'

describe('ImageMenuItem', function() {
  let wrapper, vm
  const push = sinon.spy()
  const corpus = Corpus()
  const combination = corpus.combinations.get(corpus.combinations.keys()[0])
  const image = corpus.imageReferences.get(combination.imageReferences[0])
  beforeEach(() => push.reset())

  describe('all router changes', () => {
    beforeEach(() => {
      wrapper = mount(ImageMenuItem, {
        propsData: {
          corpus: corpus,
          image: image,
          scrollID: combination.scroll_id,
          scrollVersionID: combination.scroll_version_id
        },
        mocks: {
          $router: { push },
          $route: {
            params: {
              scrollID: 20,
              scrollVersionID: 324,
              imageID: 23,
            },
          },
        },
      })
      vm = wrapper.vm
    })

    it('changes router properly when clicked', () => {
      wrapper.find('div.clickable-menu-item').trigger('click')
      expect(wrapper.vm.open).to.equal(true)

      // assertions
      expect(push.firstCall.args[0].name).to.equal('workbenchAddress')
      expect(push.firstCall.args[0].params.imageID).to.equal(image.image_catalog_id)
      expect(push.firstCall.args[0].params.scrollID).to.equal(combination.scroll_id)
      expect(push.firstCall.args[0].params.scrollVersionID).to.equal(combination.scroll_version_id)

      wrapper.find('div.clickable-menu-item').trigger('click')
      expect(wrapper.vm.open).to.equal(false)
    })
  })

  describe('Changed scrollVersionID and imageID', () => {
    beforeEach(() => {
      wrapper = mount(ImageMenuItem, {
        propsData: {
          corpus: corpus,
          image: image,
          scrollID: combination.scroll_id,
          scrollVersionID: combination.scroll_version_id
        },
        mocks: {
          $router: { push },
          $route: {
            params: {
              scrollID: combination.scroll_id,
              scrollVersionID: 324,
              imageID: 23,
            },
          },
        },
      })
      vm = wrapper.vm
    })

    it('changes router properly when clicked', () => {
      wrapper.find('div.clickable-menu-item').trigger('click')
      expect(wrapper.vm.open).to.equal(true)

      // assertions
      expect(push.firstCall.args[0].name).to.equal('workbenchAddress')
      expect(push.firstCall.args[0].params.imageID).to.equal(image.image_catalog_id)
      expect(push.firstCall.args[0].params.scrollID).to.equal(combination.scroll_id)
      expect(push.firstCall.args[0].params.scrollVersionID).to.equal(combination.scroll_version_id)
    })
  })

  describe('Changed only imageID', () => {
    beforeEach(() => {
      wrapper = mount(ImageMenuItem, {
        propsData: {
          corpus: corpus,
          image: image,
          scrollID: combination.scroll_id,
          scrollVersionID: combination.scroll_version_id
        },
        mocks: {
          $router: { push },
          $route: {
            params: {
              scrollID: combination.scroll_id,
              scrollVersionID: combination.scroll_version_id,
              imageID: 23,
            },
          },
        },
      })
      vm = wrapper.vm
    })

    it('changes router properly when clicked', () => {
      wrapper.find('div.clickable-menu-item').trigger('click')
      expect(wrapper.vm.open).to.equal(true)

      // assertions
      expect(push.firstCall.args[0].name).to.equal('workbenchAddress')
      expect(push.firstCall.args[0].params.imageID).to.equal(image.image_catalog_id)
      expect(push.firstCall.args[0].params.scrollID).to.equal(combination.scroll_id)
      expect(push.firstCall.args[0].params.scrollVersionID).to.equal(combination.scroll_version_id)
    })
  })

  describe('No changes', () => {
    beforeEach(() => {
      wrapper = mount(ImageMenuItem, {
        propsData: {
          corpus: corpus,
          image: image,
          scrollID: combination.scroll_id,
          scrollVersionID: combination.scroll_version_id
        },
        mocks: {
          $router: { push },
          $route: {
            params: {
              scrollID: combination.scroll_id,
              scrollVersionID: combination.scroll_version_id,
              imageID: image.image_catalog_id,
            },
          },
        },
      })
      vm = wrapper.vm
    })

    it('changes router properly when clicked', () => {
      wrapper.find('div.clickable-menu-item').trigger('click')
      expect(wrapper.vm.open).to.equal(true)

      // assertions
      expect(push).to.have.callCount(0)
    })
  })
})
