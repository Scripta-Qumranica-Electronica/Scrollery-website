"use strict"

import { mount } from '@test'
import MainMenu from '~/components/menu/MainMenu.vue'

describe("MainMenu", function() {
    let wrapper, vm

    beforeEach(() => {
      wrapper = mount(MainMenu, {
        propsData: {
            corpus: new Corpus(),
            open: true,
            keepOpen: true,
        }
      })
      vm = wrapper.vm
    })

    it('has a div', () => {
      expect(wrapper.contains('div')).to.equal(true)
    })

})

class Corpus {

    /**
     * @param {object}          attributes the image attributes
     * @param {array.<MenuImage>=[]} [images]    an array of images
     */
    constructor() {
        this.combinations = new Combinations()
    }
    populateCombinations() {
        
    }
    populateColumnsOfScrollVersion(versionID, scrollID) {
        return {versionID: versionID, scrollID: scrollID}
    }
    populateImagesOfScrollVersion(versionID, scrollID) {
        return {versionID: versionID, scrollID: scrollID}
    }
  }

class Combinations {
    constructor() {
        this.items = {
            2: {
                name: 'test'
            }
        }
    }
    get(id) {
        return this.items[id]
    }
    keys() {
        return Object.keys(this.items)
    }
}