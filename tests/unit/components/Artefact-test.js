"use strict"

import { mount } from '@test'
import Artefact from '~/components/Artefact.vue'

describe("Artefact", function() {

    let wrapper, vm
    const imgDPI = 400
    const baseDPI = 1215
    const correctScale = baseDPI / imgDPI
    const artefactID = 1
    const imageID = 2
    beforeEach(() => {
      wrapper = mount(Artefact, {
        propsData: {
            artefactData:{
                dpi: imgDPI,
                transformMatrix: [[1,0,0],[0,1,0]],
                artefact_id: artefactID,
                image: imageID,
                rect: {
                    x: 1,
                    y: 1,
                    width: 1,
                    height: 1,
                },
                poly: 'M0,0 0,1 1,1 1,0 0,0'
            },
            corpus: new MenuCorpus(),
            baseDPI: baseDPI,
        },
      })
      vm = wrapper.vm
    })

    it('has the proper scale', () => {
        expect(vm.scale).to.equal(correctScale)
    })

    it('has an SVG g element', () => {
        expect(wrapper.contains('g')).to.equal(true)
    })

    it('has the proper SVG path', () => {
        expect(wrapper.contains('g > defs > path')).to.equal(true)
    })

    it('has the proper SVG clipPath', () => {
        expect(wrapper.contains(`g > defs > #clip-${imageID}-${artefactID}`)).to.equal(true)
    })

    it('has the proper SVG clipPath use', () => {
        expect(wrapper.contains(`g > defs > #clip-${imageID}-${artefactID} > use`)).to.equal(true)
    })

    it('has an SVG image element', () => {
        expect(wrapper.contains('g > image')).to.equal(true)
    })
})

class MenuCorpus {

    /**
     * @param {object}          attributes the image attributes
     * @param {array.<MenuImage>=[]} [images]    an array of images
     */
    constructor() {
        this.images = new MenuImages()
    }
}

class MenuImages {
    constructor() {
        this._items = {
            2: {
                _items: {
                    3: {
                        name: 'test',
                        isMaster: 1,
                        //Maybe in the future we put in a real image
                        url: 'url',
                        fileName: 'filename',
                        suffix: 'suffix'
                    }
                },
                _itemList: [3]
            }
        }
        this._itemList = [2]
    }
    itemWithID(id) {
        return this._items[id]
    }
}