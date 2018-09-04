'use strict'

import { mount } from '@test'
import CombinationMenuItem from '~/components/menu/CombinationMenuItem.vue'
import Corpus from '../../../.utils/factories/Corpus-factory.js'

describe('CombinationMenuItem', function() {
  let wrapper, vm
  const push = sinon.spy()
  const corpus = new Corpus()
  const combination = corpus.combinations.get(corpus.combinations.keys()[0])

  describe('all router changes', () => {
    const combinationLockStatus = combination.locked
    beforeEach(() => {
      wrapper = mount(CombinationMenuItem, {
        propsData: {
          corpus: corpus,
          combination: combination
        },
        mocks: {
          $router: { push },
          $route: {
            params: {
              scrollID: 20,
              scrollVersionID: 324
            }
          }
        }
      })
      vm = wrapper.vm
    })

    it('responds properly to clicks', () => {
      wrapper.find('span').trigger('click')
      expect(vm.open).to.equal(true)

      // assertions
      expect(push.firstCall.args[0].name).to.equal('workbenchAddress')
      expect(push.firstCall.args[0].params.scrollID).to.equal(combination.scroll_id)
      expect(push.firstCall.args[0].params.scrollVersionID).to.equal(combination.scroll_version_id)

      wrapper.find('span').trigger('click')
      expect(vm.open).to.equal(false)
    })

    it('toggles columns', () => {
      vm.toggleColumns()
      expect(vm.showColumns).to.equal(true)
    })

    it('toggles images', () => {
      vm.toggleImages()
      expect(vm.showImages).to.equal(true)
    })
  })

  describe('no router change', () => {
    beforeEach(() => {
      wrapper = mount(CombinationMenuItem, {
        propsData: {
          corpus: corpus,
          combination: combination
        },
        mocks: {
          $router: { push },
          $route: {
            params: {
              scrollID: combination.scroll_id,
              scrollVersionID: combination.scroll_version_id
            }
          }
        }
      })
      vm = wrapper.vm
    })

    it('responds properly to clicks', () => {
      wrapper.find('span').trigger('click')
      expect(wrapper.vm.open).to.equal(true)

      // assertions
      expect(push.firstCall.args[0].name).to.equal('workbenchAddress')
      expect(push.firstCall.args[0].params.scrollID).to.equal(combination.scroll_id)
      expect(push.firstCall.args[0].params.scrollVersionID).to.equal(combination.scroll_version_id)
    })

    it('can start editing a name', () => {
      vm.startNameChange()

      // assertions
      expect(vm.nameInput).to.equal(combination.name)
    })

    it('can change a name', () => {
      const newName = 'new name'
      const oldName = combination.name
      vm.startNameChange()
      vm.nameInput = newName
      vm.setName()

      // assertions
      expect(vm.nameInput).to.equal(newName)
      // expect the write to fail without AJAX completion
      expect(combination.name).to.equal(oldName)
    })

    it('does nothing when changing to undefined name', () => {
      vm.nameInput = undefined
      vm.setName()

      // assertions
      expect(vm.nameInput).to.equal(undefined)
    })

    it('can delete itself', () => {
      const oldName = combination.name
      vm.deleteCombination()

      // expect the write to fail without AJAX completion
      expect(combination.name).to.equal(oldName)
    })
  })

  describe('Only scroll version change', () => {
    beforeEach(() => {
      wrapper = mount(CombinationMenuItem, {
        propsData: {
          corpus: corpus,
          combination: combination
        },
        mocks: {
          $router: { push },
          $route: {
            params: {
              scrollID: combination.scroll_id,
              scrollVersionID: 10000001
            }
          }
        }
      })
      vm = wrapper.vm
    })

    it('responds properly to clicks', () => {
      wrapper.find('span').trigger('click')
      expect(wrapper.vm.open).to.equal(true)

      // assertions
      expect(push.firstCall.args[0].name).to.equal('workbenchAddress')
      expect(push.firstCall.args[0].params.scrollID).to.equal(combination.scroll_id)
      expect(push.firstCall.args[0].params.scrollVersionID).to.equal(combination.scroll_version_id)
    })
  })
})
