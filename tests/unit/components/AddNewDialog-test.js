'use strict'

import { mount } from '@test'
import AddNewDialog from '~/components/AddNewDialog.vue'

describe('AddNewDialog', function() {
  let wrapper, vm
  const initialCombination = 1
  const initialImage = 1
  beforeEach(() => {
    wrapper = mount(AddNewDialog, {
      propsData: {
        corpus: new MenuCorpus(),
        initialCombination: initialCombination,
        initialImage: initialImage,
        addType: 'artefacts',
      },
    })
    vm = wrapper.vm
  })

  it('has a proper initial state', () => {
    expect(wrapper.props().initialCombination).to.equal(initialCombination)
    expect(wrapper.props().initialImage).to.equal(initialImage)
    expect(vm.selectedCombination).to.equal(initialCombination)
    expect(vm.selectedImage).to.equal(initialImage)
  })

  it('has a combination select dropdown', () => {
    expect(wrapper.contains('el-select.combination-selector')).to.equal(true)
  })

  it('has an image select dropdown', () => {
    expect(wrapper.contains('el-select.image-selector')).to.equal(true)
  })

  it('has a list of artefacts', () => {
    expect(wrapper.contains('div.add-dialog-menu-listings > ul')).to.equal(true)
  })

  describe('Data Model: ', () => {
    it('selects a new combination', done => {
      wrapper.setData({ selectedCombination: 2 })
      setTimeout(function() {
        expect(wrapper.vm.selectedImage).to.equal(2)
        done()
      }, 500)
    })

    it('selects a new image', () => {
      wrapper.setData({ selectedImage: 2 })
      expect(wrapper.vm.selectedImage).to.equal(2)
    })
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
    this.artefacts = new MenuArtefacts()
  }
  // populateColumnsOfScrollVersion(versionID, scrollID) {
  //   return { versionID: versionID, scrollID: scrollID }
  // }
  populateImagesOfScrollVersion(versionID, scrollID) {
    return new Promise((resolve, reject) => {
      resolve({ versionID: versionID, scrollID: scrollID })
    })
  }
  populateArtefactsofImage(versionID, scrollID) {
    return { versionID: versionID, scrollID: scrollID }
  }
}

class MenuCombinations {
  constructor() {
    this._items = {
      1: {
        name: 'test1',
        version: '1',
        images: [1],
      },
      2: {
        name: 'test2',
        version: '2',
        images: [2],
      },
    }
    this._itemList = [1, 2]
  }
  itemWithID(id) {
    return this._items[id]
  }
}

class MenuImages {
  constructor() {
    this._items = {
      1: {
        institution: 'IAA',
        lvl1: '1-1',
        lvl2: '1-2',
        side: 0,
        artefacts: [1],
      },
      2: {
        institution: 'IAA',
        lvl1: '2-1',
        lvl2: '2-2',
        side: 0,
        artefacts: [2],
      },
    }
    this._itemList = [1, 2]
  }
  itemWithID(id) {
    return this._items[id]
  }
}

class MenuArtefacts {
  constructor() {
    this._items = {
      1: {
        name: 'test1',
      },
      2: {
        name: 'test2',
      },
    }
    this._itemList = [1, 2]
  }
  itemWithID(id) {
    return this._items[id]
  }
}
