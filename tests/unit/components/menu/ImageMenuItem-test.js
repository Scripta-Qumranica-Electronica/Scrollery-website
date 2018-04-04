"use strict"

import { mount } from '@test'
import ImageMenuItem from '~/components/menu/ImageMenuItem.vue'

describe("ImageMenuItem", function() {
    let wrapper, vm
    const fakeID = 12345

    beforeEach(() => {
        wrapper = mount(ImageMenuItem, {
            propsData: {
                dataId: fakeID,
            }
        })
        vm = wrapper.vm
    })
    
    it('responds properly to clicks', done => {
        const push = sinon.spy()
        const imageID = 4284
        const plate = '1094'
        const fragment = '1'
        const institution = 'IAA'
        const scrollVersionID = '1231'
        const versionID = scrollVersionID
        const scrollID = '894'

        // create wrapper with mocked route and routers
        let wrapper = mount(ImageMenuItem, {
            propsData: {
                dataId: imageID,
                plate: plate,
                fragment: fragment,
                institution: institution,
                versionID: versionID,
            },
            mocks: { 
                $router: { push },
                $route: {
                    params: { 
                        imageID,
                        scrollID: scrollID,
                        scrollVersionID: scrollVersionID,
                    }
                }
            }
        })
        wrapper.vm.$post = function(url, payload) {
            expect(payload.image_id).to.equal(imageID)
            expect(payload.version_id).to.equal(versionID)
            expect(payload.transaction).to.equal('getArtOfImage')
            
            done()
    
            // adhere to interface
            return new Promise();
        }.bind(vm)

        wrapper.find('span').trigger('click')

        // assertions
        expect(push.firstCall.args[0].name).to.equal("workbenchAddress")
        expect(push.firstCall.args[0].params).to.include({ imageID })
    })

    it('can handle empty $post return data', done => {
        const imageID = 4284
        const plate = '1094'
        const fragment = '1'
        const institution = 'IAA'
        const scrollVersionID = '1231'
        const versionID = scrollVersionID
        const scrollID = '894'

        const returnData = {
            status: 200,
          }

        // create wrapper with mocked route and routers
        let wrapper = mount(ImageMenuItem, {
            propsData: {
                dataId: imageID,
                plate: plate,
                fragment: fragment,
                institution: institution,
                versionID: versionID,
            },
        })
        wrapper.vm.$post = function() {
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

    it('can $post to get children', done => {
        const imageID = 4284
        const plate = '1094'
        const fragment = '1'
        const institution = 'IAA'
        const scrollVersionID = '1231'
        const versionID = scrollVersionID
        const scrollID = '894'

        const returnData = {
            status: 200,
            data: {
                results: [
                    {artefact_id: 1},
                ],
            },
          }

        // create wrapper with mocked route and routers
        let wrapper = mount(ImageMenuItem, {
            propsData: {
                dataId: imageID,
                plate: plate,
                fragment: fragment,
                institution: institution,
                versionID: versionID,
            },
        })
        wrapper.vm.$post = function() {
            return new Promise((resolve, reject) => resolve(returnData))
        }.bind(vm)

        wrapper.vm.fetchChildren()

        // assertions
        wrapper.vm.$nextTick(() => {
            // How do I check my data() to make sure this.children is correct?
            // expect(wrapper.vm.children).to.deep.equal(returnData.data.results)
            done() // ends the test
          })
        
    })

    it('pushes data to the router', () => {
        const push = sinon.spy()
        const imageID = 4284
        const plate = '1094'
        const fragment = '1'
        const institution = 'IAA'
        const scrollVersionID = '1231'
        const versionID = scrollVersionID
        const scrollID = '894'

        // create wrapper with mocked route and routers
        let wrapper = mount(ImageMenuItem, {
            propsData: {
                dataId: imageID,
                plate: plate,
                fragment: fragment,
                institution: institution,
                versionID: versionID,
            },
            mocks: { 
                $router: { push },
                $route: {
                    params: { 
                        imageID,
                        scrollID: scrollID,
                        scrollVersionID: scrollVersionID,
                    }
                }
            }
        })

        wrapper.vm.setRouter()

        // assertions
        expect(push.firstCall.args[0].name).to.equal("workbenchAddress")
        expect(push.firstCall.args[0].params).to.include({ imageID })
    })

    it('has a span', () => {
      expect(wrapper.contains('span')).to.equal(true)
    })

    it('has a div', () => {
        expect(wrapper.contains('div')).to.equal(true)
      })
})