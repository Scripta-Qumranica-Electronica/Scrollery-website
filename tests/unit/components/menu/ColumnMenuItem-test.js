"use strict"

import { mount } from '@test'
import ColumnMenuItem from '~/components/menu/ColumnMenuItem.vue'

describe("ColumnMenuItem", function() {
    let wrapper, vm
    const fakeID = 12345
    const name = 'test col'

    beforeEach(() => {
        wrapper = mount(ColumnMenuItem, {
            propsData: {
                dataId: fakeID,
                name: name,
            }
        })
        vm = wrapper.vm
    })
    
    it('pushes data to the router', () => {
        const push = sinon.spy()
        const colID = 12345

        // create wrapper with mocked route and routers
        let wrapper = mount(ColumnMenuItem, {
            propsData: {
                dataId: colID,
                name: name,
            },
            mocks: { 
                $router: { push },
                $route: {
                    params: { 
                        colID,
                        scrollID: 808,
                        scrollVersionID: 1,
                    }
                }
            }
        })
        wrapper.find('span').trigger('click')

        // assertions
        expect(push.firstCall.args[0].name).to.equal("workbenchAddress")
        expect(push.firstCall.args[0].params).to.include({ colID })
    })

    it('has a span', () => {
      expect(wrapper.contains('span')).to.equal(true)
    })
})