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
    
    // it('pushes data to the router', () => {
    //     sinon.spy(vm, "setRouter");
    //     // const span = wrapper.find('span')[0]
    //     // span.simulate('click')
    //     vm.setRouter()
    //     expect(vm.setRouter).toHaveBeenCalled();
    // })

    it('has a span', () => {
      expect(wrapper.contains('span')).to.equal(true)
    })
})