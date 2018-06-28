"use strict"

import { mount } from '@test'
import ColumnMenuItem from '~/components/menu/ColumnMenuItem.vue'
import Corpus from '../../../.utils/factories/Corpus-factory.js'

describe("ColumnMenuItem", function() {
  let wrapper, vm
  const corpus = Corpus()
  const combination = corpus.combinations.get(corpus.combinations.keys()[0])
  const column = corpus.cols.get(combination.cols[0], combination.scroll_version_id)
  const push = sinon.spy()
  beforeEach(() => push.reset())
  
  it('responds to all router changes', () => {
    wrapper = mount(ColumnMenuItem, {
      propsData: {
        scrollID: combination.scroll_id,
        scrollVersionID: combination.scroll_version_id,
        column: column,
        corpus: corpus,
      },
      mocks: { 
        $router: { push },
        $route: {
          params: { 
            scrollID: 10000001,
            scrollVersionID: 10000001,
            colID: 10000001,
          }
        },
      }
    })
    vm = wrapper.vm
    wrapper.find('span.clickable-menu-item').trigger('click')

    // assertions 
    expect(push.firstCall.args[0].params.scrollID).to.equal(combination.scroll_id)
    expect(push.firstCall.args[0].params.scrollVersionID).to.equal(combination.scroll_version_id)
    expect(push.firstCall.args[0].params.colID).to.equal(column.col_id)
  })

  it('responds to column router changes', () => {
    wrapper = mount(ColumnMenuItem, {
      propsData: {
        scrollID: combination.scroll_id,
        scrollVersionID: combination.scroll_version_id,
        column: column,
        corpus: corpus,
      },
      mocks: { 
        $router: { push },
        $route: {
          params: { 
            scrollID: combination.scroll_id,
            scrollVersionID: combination.scroll_version_id,
            colID: 10000001,
          }
        },
      }
    })
    vm = wrapper.vm
    wrapper.find('span.clickable-menu-item').trigger('click')

    // assertions 
    expect(push.firstCall.args[0].params.scrollID).to.equal(combination.scroll_id)
    expect(push.firstCall.args[0].params.scrollVersionID).to.equal(combination.scroll_version_id)
    expect(push.firstCall.args[0].params.colID).to.equal(column.col_id)
  })

  it('responds to column and scroll version router changes', () => {
    wrapper = mount(ColumnMenuItem, {
      propsData: {
        scrollID: combination.scroll_id,
        scrollVersionID: combination.scroll_version_id,
        column: column,
        corpus: corpus,
      },
      mocks: { 
        $router: { push },
        $route: {
          params: { 
            scrollID: combination.scroll_id,
            scrollVersionID: 10000001,
            colID: 10000001,
          }
        },
      }
    })
    vm = wrapper.vm
    wrapper.find('span.clickable-menu-item').trigger('click')

    // assertions 
    expect(push.firstCall.args[0].params.scrollID).to.equal(combination.scroll_id)
    expect(push.firstCall.args[0].params.scrollVersionID).to.equal(combination.scroll_version_id)
    expect(push.firstCall.args[0].params.colID).to.equal(column.col_id)
  })

  it('responds to no router changes', () => {
    wrapper = mount(ColumnMenuItem, {
      propsData: {
        scrollID: combination.scroll_id,
        scrollVersionID: combination.scroll_version_id,
        column: column,
        corpus: corpus,
      },
      mocks: { 
        $router: { push },
        $route: {
          params: { 
            scrollID: combination.scroll_id,
            scrollVersionID: combination.scroll_version_id,
            colID: column.col_id,
          }
        },
      }
    })
    vm = wrapper.vm
    wrapper.find('span.clickable-menu-item').trigger('click')

    // assertions 
    expect(push).to.have.callCount(0)
  })
})
