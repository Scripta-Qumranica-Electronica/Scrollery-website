'use strict'

import { mount } from '@test'
import CombinationMenuItem from '~/components/menu/CombinationMenuItem.vue'

describe('CombinationMenuItem', function() {
  let wrapper, vm
  const push = sinon.spy()
  const scrollID = 2
  const scrollVersionID = 2

  beforeEach(() => {
    wrapper = mount(CombinationMenuItem, {
      propsData: {
        corpus: new MenuCorpus(),
        scrollID: scrollID,
        versionID: scrollVersionID,
      },
      mocks: {
        $router: { push },
        $route: {
          params: {
            scrollID: 20,
            scrollVersionID: 324,
          },
        },
      },
    })
    vm = wrapper.vm
  })

  // This does run over all the code, but
  // I should be able to test a little bit more
  // like checking the router and the name in the span.
  it('responds properly to clicks', () => {
    wrapper.find('span').trigger('click')
    expect(wrapper.vm.open).to.equal(true)

    // assertions
    // expect(push.firstCall.args[0].params.scrollID).to.include({ scrollID })
    // expect(push.firstCall.args[0].params.scrollVersionID).to.include({ scrollVersionID })
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
