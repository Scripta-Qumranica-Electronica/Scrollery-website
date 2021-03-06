"use strict"

import { mount } from '@test'
import ColumnMenuItem from '~/components/menu/ColumnMenuItem.vue'
import Corpus from '../../../.utils/factories/Corpus-factory.js'

describe("ColumnMenuItem", function() {
  let wrapper, vm
  const push = sinon.spy()
  const corpus = new Corpus() 
  const combination = corpus.combinations.get(corpus.combinations.keys()[0])
  const column = corpus.cols.get(combination.cols[0], combination.scroll_version_id)

  describe('all router changes', () => {
    beforeEach(() => {
      wrapper = mount(ColumnMenuItem, {
        propsData: {
          scrollID: combination.scroll_id,
          scrollVersionID: combination.scroll_version_id,
          column: column,
          corpus: corpus
        },
        mocks: { 
          $router: { push },
          $route: {
            params: { 
              scrollID: 10000001,
              scrollVersionID: 10000001,
              colID: 10000001
            }
          },
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
      expect(push.firstCall.args[0].params.colID).to.equal(column.col_id)
    })
  })

  describe('Scroll version and col_version router changes', () => {
    beforeEach(() => {
      wrapper = mount(ColumnMenuItem, {
        propsData: {
          scrollID: combination.scroll_id,
          scrollVersionID: combination.scroll_version_id,
          column: column,
          corpus: corpus
        },
        mocks: { 
          $router: { push },
          $route: {
            params: { 
              scrollID: combination.scroll_id,
              scrollVersionID: 10000001,
              colID: 10000001
            }
          },
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
      expect(push.firstCall.args[0].params.colID).to.equal(column.col_id)
    })
  })

  describe('Scroll version router change', () => {
    beforeEach(() => {
      wrapper = mount(ColumnMenuItem, {
        propsData: {
          scrollID: combination.scroll_id,
          scrollVersionID: combination.scroll_version_id,
          column: column,
          corpus: corpus
        },
        mocks: { 
          $router: { push },
          $route: {
            params: { 
              scrollID: combination.scroll_id,
              scrollVersionID: 10000001,
              colID: column.col_id
            }
          },
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
      expect(push.firstCall.args[0].params.colID).to.equal(column.col_id)
    })
  })

  describe('Column router change', () => {
    beforeEach(() => {
      wrapper = mount(ColumnMenuItem, {
        propsData: {
          scrollID: combination.scroll_id,
          scrollVersionID: combination.scroll_version_id,
          column: column,
          corpus: corpus
        },
        mocks: { 
          $router: { push },
          $route: {
            params: { 
              scrollID: combination.scroll_id,
              scrollVersionID: combination.scroll_version_id,
              colID: 10000001
            }
          },
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
      expect(push.firstCall.args[0].params.colID).to.equal(column.col_id)
    })
  })

  describe('No router change', () => {
    beforeEach(() => {
      wrapper = mount(ColumnMenuItem, {
        propsData: {
          scrollID: combination.scroll_id,
          scrollVersionID: combination.scroll_version_id,
          column: column,
          corpus: corpus
        },
        mocks: { 
          $router: { push },
          $route: {
            params: { 
              scrollID: combination.scroll_id,
              scrollVersionID: combination.scroll_version_id,
              colID: column.col_id
            }
          },
        }
      })
      vm = wrapper.vm
    })

    it('responds properly to clicks', () => {
      push.reset()
      wrapper.find('span.clickable-menu-item').trigger('click')

      // assertions
      expect(push).to.have.callCount(0)
    })

    it('can start editing a name', () => {
      vm.startNameChange()

      // assertions 
      expect(vm.nameInput).to.equal(column.name)
    })

    it('can change a name', () => {
      const newName = 'new name'
      const oldName = column.name
      vm.startNameChange()
      vm.nameInput = newName
      vm.setName()

      // assertions 
      expect(vm.nameInput).to.equal(newName)
      // expect the write to fail without AJAX completion
      expect(column.name).to.equal(oldName)
    })

    it('does nothing when changing to undefined name', () => {
      vm.nameInput = undefined
      vm.setName()

      // assertions 
      expect(vm.nameInput).to.equal(undefined)
    })

    it('can delete itself', () => {
      const oldName = column.name
      vm.deleteColumn()

      // expect the write to fail without AJAX completion
      expect(column.name).to.equal(oldName)
    })
  })
})