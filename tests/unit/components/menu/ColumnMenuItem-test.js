"use strict"

import { mount } from '@test'
import ColumnMenuItem from '~/components/menu/ColumnMenuItem.vue'

describe("ColumnMenuItem", function() {
    let wrapper, vm
    const push = sinon.spy()
    const scrollID = 2
    const scrollVersionID = 2
    const columnID = 2
    const column = {
        name: 'none'
    }

    beforeEach(() => {
        wrapper = mount(ColumnMenuItem, {
            propsData: {
                scrollID: scrollID,
                versionID: scrollVersionID,
                columnID: columnID,
                column: column,
            },
            mocks: { 
                $router: { push },
                $route: {
                    params: { 
                        scrollID: 20,
                        scrollVersionID: 324,
                        columnID: 23,
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

        // assertions 
        // expect(push.firstCall.args[0].params.scrollID).to.include({ scrollID })
        // expect(push.firstCall.args[0].params.scrollVersionID).to.include({ scrollVersionID })
    })
})
