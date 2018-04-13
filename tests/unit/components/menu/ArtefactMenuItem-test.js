"use strict"

import { mount } from '@test'
import ArtefactMenuItem from '~/components/menu/ArtefactMenuItem.vue'

describe("ArtefactMenuItem", function() {
    let wrapper, vm
    const push = sinon.spy()
    const scrollID = 2
    const scrollVersionID = 2
    const imageID = 2
    const artID = 2

    beforeEach(() => {
        wrapper = mount(ArtefactMenuItem, {
            propsData: {
                artefactID: artID,
                scrollID: scrollID,
                imageID: imageID,
                scrollVersionID: scrollVersionID,
                corpus: new MenuCorpus(),
            },
            mocks: { 
                $router: { push },
                $route: {
                    params: { 
                        artID: 34,
                        scrollID: 33,
                        scrollVersionID: 32,
                    }
                }
            }
        })
        vm = wrapper.vm
    })
    
    // This does run over all the code, but
    // I should be able to test a little bit more 
    // like checking the router and the name in the span.
    it('responds properly to clicks', () => {
        wrapper.find('span').trigger('click')

        // assertions
        // expect(push.firstCall.args[0].name).to.equal("workbenchAddress")
        // expect(push.firstCall.args[0].params.artID).to.equal(artID)
    })
})

class MenuCorpus {

    /**
     * @param {object}          attributes the image attributes
     * @param {array.<MenuImage>=[]} [images]    an array of images
     */
    constructor() {
        this.artefacts = {
            fetchMask: (version, artefact) => {
                return new Promise((resolve, reject) => {
                    resolve('good')
                })
            },
            itemWithID: (id) => {
                return {name: 'none'}
            }
        }
    }
}
