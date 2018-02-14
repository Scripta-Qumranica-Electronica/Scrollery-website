"use strict"

import { mount } from '@test'
import ArtefactMenuItem from '~/components/ArtefactMenuItem.vue'

describe("ArtefactMenuItem", function() {
    let wrapper, vm
    const fakeID = 12345

    beforeEach(() => {
        wrapper = mount(ArtefactMenuItem, {
            propsData: {
                dataId: fakeID,
            }
        })
        vm = wrapper.vm
    })
    
    it('pushes data to the router', () => {
        const push = sinon.spy()
        const scrollID = 12345

        // create wrapper with mocked route and routers
        let wrapper = mount(ArtefactMenuItem, {
            mocks: { 
                $router: { push },
                $route: {
                    params: { scrollID }
                }
            }
        })
        wrapper.find('span').trigger('click')

        // assertions
        expect(push.firstCall.args[0].name).to.equal("workbenchAddress")
        expect(push.firstCall.args[0].params).to.include({ scrollID })
    })

    it('has a span', () => {
      expect(wrapper.contains('span')).to.equal(true)
    })
})