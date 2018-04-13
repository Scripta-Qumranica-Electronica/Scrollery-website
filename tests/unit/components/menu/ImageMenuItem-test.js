'use strict'

import { mount } from '@test'
import ImageMenuItem from '~/components/menu/ImageMenuItem.vue'

describe('ImageMenuItem', function() {
  let wrapper, vm
  const push = sinon.spy()
  const scrollID = 2
  const scrollVersionID = 2
  const imageID = 2

  beforeEach(() => {
    wrapper = mount(ImageMenuItem, {
      propsData: {
        corpus: new MenuCorpus(),
        scrollID: scrollID,
        versionID: scrollVersionID,
        imageID: imageID,
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

  // This does run over all the code, but
  // I should be able to test a little bit more
  // like checking the router and the name in the span.
  it('responds properly to clicks', () => {
    wrapper.find('span').trigger('click')
    expect(wrapper.vm.open).to.equal(true)

    // assertions
    expect(push.firstCall.args[0].name).to.equal('workbenchAddress')
    expect(push.firstCall.args[0].params.imageID).to.equal(imageID)
  })

  it('can add a new artefact', () => {
    wrapper.find('li').trigger('click')
    expect(wrapper.vm.dialogVisible).to.equal(true)
  })
})

class MenuCorpus {
  /**
   * @param {object}          attributes the image attributes
   * @param {array.<MenuImage>=[]} [images]    an array of images
   */
  constructor() {
    this.combinations = new MenuCombinations()
    this.images = new MenuImages()
  }
  populateColumnsOfScrollVersion(versionID, scrollID) {
    return { versionID: versionID, scrollID: scrollID }
  }
  populateImagesOfScrollVersion(versionID, scrollID) {
    return { versionID: versionID, scrollID: scrollID }
  }
  populateArtefactsofImage(versionID, scrollID) {
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

class MenuImages {
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
