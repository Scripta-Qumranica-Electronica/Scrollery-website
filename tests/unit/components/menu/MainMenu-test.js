'use strict'

import { mount } from '@test'
import MainMenu from '~/components/menu/MainMenu.vue'

describe('MainMenu', function() {
  let wrapper, vm

  beforeEach(() => {
    wrapper = mount(MainMenu, {
      propsData: {
        corpus: new MenuCorpus(),
      },
    })
    vm = wrapper.vm
  })

  it('has a div', () => {
    expect(wrapper.contains('div')).to.equal(true)
  })
})

class MenuCorpus {
  /**
   * @param {object}          attributes the image attributes
   * @param {array.<MenuImage>=[]} [images]    an array of images
   */
  constructor() {
    this.combinations = new MenuCombinations()
  }
  populateColumnsOfScrollVersion(versionID, scrollID) {
    return { versionID: versionID, scrollID: scrollID }
  }
  populateImagesOfScrollVersion(versionID, scrollID) {
    return { versionID: versionID, scrollID: scrollID }
  }
}

class MenuCombinations {
  constructor() {
    this.items = {
      2: {
        name: 'test',
      },
    }
  }
  itemWithID(id) {
    return this.items[id]
  }
}
