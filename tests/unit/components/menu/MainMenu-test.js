'use strict'

import { mount } from '@test'
import MainMenu from '~/components/menu/MainMenu.vue'
import Corpus from '../../../.utils/factories/Corpus-factory.js'

describe('MainMenu', function() {
  let wrapper, vm
  const corpus = new Corpus()

  beforeEach(() => {
    wrapper = mount(MainMenu, {
      propsData: {
        corpus: corpus,
        open: true,
        keepOpen: true
      }
    })
    vm = wrapper.vm
  })

  it('has a div', () => {
    expect(wrapper.contains('div')).to.equal(true)
  })
})
