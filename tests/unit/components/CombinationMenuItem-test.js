"use strict"

import { mount } from '@test'
import CombinationMenuItem from '~/components/CombinationMenuItem.vue'

describe("CombinationMenuItem", function() {
    let wrapper, vm
    const scrollID = 894
    const scrollVersionID = 1
    const menuType = 'text'

    beforeEach(() => {
        wrapper = mount(CombinationMenuItem, {
            propsData: {
                dataId: 894,
            }
        })
        vm = wrapper.vm
    })
    
    it('responds properly to clicks', done => {
        const push = sinon.spy()

        // create wrapper with mocked route and routers
        let wrapper = mount(CombinationMenuItem, {
            propsData: {
                menuType: menuType,
            },
            mocks: { 
                $router: { push },
                $route: {
                    params: { 
                        scrollID: scrollID,
                        scrollVersionID: scrollVersionID,
                    }
                }
            }
        })
        wrapper.vm.$post = function(url, payload) {
            // expect(payload.combID).to.equal(scrollID)
            // expect(payload.version_id).to.equal(versionID)
            // expect(payload.transaction).to.equal('getColOfComb')
            
            done()
    
            // adhere to interface
            return new Promise();
        }.bind(vm)

        wrapper.find('span').trigger('click')

        // assertions
        // expect(push.firstCall.args[0].name).to.equal("workbenchAddress")
        // expect(push.firstCall.args[0].params).to.include({ scrollID })
        // expect(push.firstCall.args[0].params).to.include({ scrollVersionID })
    })

    it('can handle $post return data when fetching children', done => {
        const returnData = {
            status: 200,
            data: {
                results: [],
            },
        }

        // create wrapper with mocked route and routers
        let wrapper = mount(CombinationMenuItem, {
            propsData: {
                menuType: menuType,
            },
        })
        wrapper.vm.$post = function() {
            // adhere to interface
            return new Promise((resolve, reject) => resolve(returnData))
        }.bind(vm)

        wrapper.vm.fetchChildren()

        // assertions
        wrapper.vm.$nextTick(() => {
            // How do I check my data() to make sure this.children is correct?
            // expect(wrapper.vm.children).to.equal([])
            done() // ends the test
          })
    })

    it('can clone a scroll', done => {
        const returnData = {
            status: 200,
            data: {
                results: [],
            },
        }

        // create wrapper with mocked route and routers
        let wrapper = mount(CombinationMenuItem, {
            propsData: {
                menuType: menuType,
            },
        })
        wrapper.vm.$post = function() {
            // adhere to interface
            return new Promise((resolve, reject) => resolve(returnData))
        }.bind(vm)

        wrapper.vm.cloneScroll()

        // assertions
        wrapper.vm.$nextTick(() => {
            // How do I check my data() to make sure this.children is correct?
            // expect(wrapper.vm.children).to.equal([])
            done() // ends the test
          })
    })

    it('watches for menuType changes', done => {
        const returnData = {
            status: 200,
            data: {
                results: [],
            },
        }

        // create wrapper with mocked route and routers
        let wrapper = mount(CombinationMenuItem, {
            propsData: {
                menuType: menuType,
            },
        })
        wrapper.vm.$post = function() {
            // adhere to interface
            return new Promise((resolve, reject) => resolve(returnData))
        }.bind(vm)

        // const spy = sinon.spy(wrapper.vm.fetchChildren)
        wrapper.vm.open = true
        wrapper.setProps({menuType: 'image'})
        

        // assertions
        wrapper.vm.$nextTick(() => {
            // How do I check my data() to make sure this.children is correct?
            // expect(wrapper.vm.children).to.equal([])
            // expect(spy).to.have.been.called()
            done() // ends the test
          })
    })

    // it('can $post to get children', done => {
    //     const imageID = 4284
    //     const plate = '1094'
    //     const fragment = '1'
    //     const institution = 'IAA'
    //     const scrollVersionID = '1231'
    //     const versionID = scrollVersionID
    //     const scrollID = '894'

    //     const returnData = {
    //         status: 200,
    //         data: {
    //             results: [
    //                 {artefact_id: 1},
    //             ],
    //         },
    //       }

    //     // create wrapper with mocked route and routers
    //     let wrapper = mount(ImageMenuItem, {
    //         propsData: {
    //             dataId: imageID,
    //             plate: plate,
    //             fragment: fragment,
    //             institution: institution,
    //             versionID: versionID,
    //         },
    //     })
    //     wrapper.vm.$post = function() {
    //         return new Promise((resolve, reject) => resolve(returnData))
    //     }.bind(vm)

    //     wrapper.vm.fetchChildren()

    //     // assertions
    //     wrapper.vm.$nextTick(() => {
    //         // How do I check my data() to make sure this.children is correct?
    //         // expect(wrapper.vm.children).to.deep.equal(returnData.data.results)
    //         done() // ends the test
    //       })
        
    // })

    // it('pushes data to the router', () => {
    //     const push = sinon.spy()
    //     const imageID = 4284
    //     const plate = '1094'
    //     const fragment = '1'
    //     const institution = 'IAA'
    //     const scrollVersionID = '1231'
    //     const versionID = scrollVersionID
    //     const scrollID = '894'

    //     // create wrapper with mocked route and routers
    //     let wrapper = mount(ImageMenuItem, {
    //         propsData: {
    //             dataId: imageID,
    //             plate: plate,
    //             fragment: fragment,
    //             institution: institution,
    //             versionID: versionID,
    //         },
    //         mocks: { 
    //             $router: { push },
    //             $route: {
    //                 params: { 
    //                     imageID,
    //                     scrollID: scrollID,
    //                     scrollVersionID: scrollVersionID,
    //                 }
    //             }
    //         }
    //     })

    //     wrapper.vm.setRouter()

    //     // assertions
    //     expect(push.firstCall.args[0].name).to.equal("workbenchAddress")
    //     expect(push.firstCall.args[0].params).to.include({ imageID })
    // })

    it('has a span', () => {
      expect(wrapper.contains('span')).to.equal(true)
    })

    it('has a div', () => {
        expect(wrapper.contains('div')).to.equal(true)
      })
})