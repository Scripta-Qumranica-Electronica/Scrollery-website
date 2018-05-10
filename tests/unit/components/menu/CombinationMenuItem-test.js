"use strict"

import { mount } from '@test'
import CombinationMenuItem from '~/components/menu/CombinationMenuItem.vue'

describe("CombinationMenuItem", function() {
    let wrapper, vm
    const push = sinon.spy()
    const scrollID = 2
    const scrollVersionID = 2
    const combination = {
        name: 'none',
        user_id: 1,
        locked: 1,
        cols: [],
        imageReferences: [],
        scroll_id: 2,
        scroll_version_id: 2
    }

    beforeEach(() => {
        wrapper = mount(CombinationMenuItem, {
            propsData: {
                corpus: new Corpus(),
                combination: combination,
            },
            mocks: { 
                $router: { push },
                $route: {
                    params: { 
                        scrollID: 20,
                        scrollVersionID: 324,
                    }
                },
            }
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

class Corpus {
    constructor() {
        this.combinations = new Combinations()
    }
    populateColumnsOfCombination(scrollID, versionID) {
        return {versionID: versionID, scrollID: scrollID}
    }
    populateImageReferencesOfCombination(scrollID, versionID) {
        return {versionID: versionID, scrollID: scrollID}
    }
}

class Combinations {
    constructor() {
        this.items = {
            2: {
                name: 'none',
                user_id: 1,
                locked: 1,
                cols: [],
                imageReferences: [],
                scroll_id: 2,
                scroll_version_id: 2
            }
        }
    }
    // get(id) {
    //     return this.items[id]
    // }
}