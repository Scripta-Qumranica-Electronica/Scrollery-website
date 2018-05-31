'use strict'

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
            artefact:{
                dpi: imgDPI,
                transform_matrix: '{"matrix": [[1,0,0],[0,1,0]]}',
                artefact_id: artefactID,
                image: imageID,
                side: 0,
                rect: 'POLYGON((0 0,0 1,1 1,1 0,0 0))',
                mask: 'POLYGON((0 0,0 1,1 1,1 0,0 0))',
                image_catalog_id: 0,
            },
            index: 0,
            images: [0,1,2,3,4],
            corpus: new MenuCorpus(),
            baseDPI: baseDPI,
        },
        baseDPI: baseDPI,
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

  it('gets an image reference', () => {
    expect(vm.imageReferences).to.deep.equal([0,1,2,3,4])
  })

  it('calculates a proper file path', () => {
    expect(vm.address).to.equal('urlfilename/0,0,1,1/pct:10/0/suffix')
  })

    // it('has the proper SVG clipPath', () => {
    //     expect(wrapper.contains(`g > defs > #clip-${imageID}-${artefactID}`)).to.equal(true)
    // })

    // it('has the proper SVG clipPath use', () => {
    //     expect(wrapper.contains(`g > defs > #clip-${imageID}-${artefactID} > use`)).to.equal(true)
    // })

    // it('has an SVG image element', () => {
    //     expect(wrapper.contains('g > image')).to.equal(true)
    // })
})

class MenuCorpus {

    /**
     * @param {object}          attributes the image attributes
     * @param {array.<MenuImage>=[]} [images]    an array of images
     */
    constructor() {
        this.imageReferences = new ImageReferences()
        this.images = new Images()
    }
}

class ImageReferences {
    constructor() {
        this._items = {
            0: {
                images: [0,1,2,3,4]
            },
        }
    }

    get(id) {
        return this._items[id]
    }
}

class Images {
    constructor() {
        this._items = {
            0: {
                name: 'test',
                isMaster: 1,
                //Maybe in the future we put in a real image
                url: 'url',
                filename: 'filename',
                suffix: 'suffix'
            }
        }
    }
    get(id) {
        return this._items[id]
    }
}
