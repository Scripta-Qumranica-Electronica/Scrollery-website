"use strict"

import { mount } from '@test'
import ArtefactMenuItem from '~/components/menu/ArtefactMenuItem.vue'
import Corpus from '../../../.utils/factories/Corpus-factory.js'

describe("ArtefactMenuItem", function() {
    let wrapper, vm
    const corpus = new Corpus()
    const combination = corpus.combinations.get(corpus.combinations.keys()[0])
    const artefact = corpus.artefacts.get(combination.artefacts[0], combination.scroll_version_id)
    const image = corpus.imageReferences.get(combination.imageReferences[0])
    describe("with artID, scrollID, and ScrollVersionID router changes", () => {
      const push = sinon.spy()
      beforeEach(() => {
        wrapper = mount(ArtefactMenuItem, {
          propsData: {
            artefact: artefact,
            scrollID: combination.scroll_id,
            imageID: image.image_catalog_id,
            scrollVersionID: combination.scroll_version_id,
          },
          mocks: { 
            $router: { push },
            $route: {
              params: { 
                  artID: 10000001,
                  scrollID: 10000001,
                  scrollVersionID: 10000001,
                  imageID: image.image_catalog_id
              }
            }
          }
        })
        vm = wrapper.vm
      })
      
      it('responds properly to clicks', () => {
          wrapper.find('span').trigger('click')

          // assertions 
          expect(push.firstCall.args[0].params.scrollID).to.equal(10000001)
          // expect(push.firstCall.args[0].params.scrollVersionID).to.equal(10000001)
          // expect(push.firstCall.args[0].params.artID).to.equal(10000001)
          // expect(push.firstCall.args[0].params.imageID).to.equal(image.image_catalog_id)
      })
    })

    describe("with all router changes", () => {
      const push = sinon.spy()
      beforeEach(() => {
        wrapper = mount(ArtefactMenuItem, {
          propsData: {
            artefact: artefact,
            scrollID: combination.scroll_id,
            imageID: image.image_catalog_id,
            scrollVersionID: combination.scroll_version_id,
          },
          mocks: { 
            $router: { push },
            $route: {
              params: { 
                  artID: 10000001,
                  scrollID: 10000001,
                  scrollVersionID: 10000001,
                  imageID: 10000001
              }
            }
          }
        })
        vm = wrapper.vm
      })
      
      it('responds properly to clicks', () => {
          wrapper.find('span').trigger('click')

          // assertions 
          expect(push.firstCall.args[0].params.scrollID).to.equal(combination.scroll_id)
          expect(push.firstCall.args[0].params.scrollVersionID).to.equal(combination.scroll_version_id)
          expect(push.firstCall.args[0].params.artID).to.equal(artefact.artefact_id)
          expect(push.firstCall.args[0].params.imageID).to.equal(image.image_catalog_id)
      })
    })

    

    // beforeEach(() => {
    //     wrapper = mount(ArtefactMenuItem, {
    //         propsData: {
    //             artefactID: artID,
    //             scrollID: scrollID,
    //             imageID: imageID,
    //             scrollVersionID: scrollVersionID,
    //             corpus: new Corpus(),
    //         },
    //         mocks: { 
    //             $router: { push },
    //             $route: {
    //                 params: { 
    //                     artID: 34,
    //                     scrollID: 33,
    //                     scrollVersionID: 32,
    //                 }
    //             }
    //         }
    //     })
    //     vm = wrapper.vm
    // })
    
    // it('responds properly to clicks with all changes', () => {
    //     wrapper.find('span').trigger('click')

    //     // assertions 
    //     expect(push.firstCall.args[0].params.scrollID).to.equal(33)
    //     expect(push.firstCall.args[0].params.scrollVersionID).to.equal(32)
    //     expect(push.firstCall.args[0].params.artID).to.equal(2)
    // })

    // beforeEach(() => {
    //     wrapper = mount(ArtefactMenuItem, {
    //         propsData: {
    //             artefactID: artID,
    //             scrollID: 33,
    //             imageID: imageID,
    //             scrollVersionID: scrollVersionID,
    //             corpus: new Corpus(),
    //         },
    //         mocks: { 
    //             $router: { push },
    //             $route: {
    //                 params: { 
    //                     artID: 34,
    //                     scrollID: 33,
    //                     scrollVersionID: 32,
    //                 }
    //             }
    //         }
    //     })
    //     vm = wrapper.vm
    // })
    
    // // This does run over all the code, but
    // // I should be able to test a little bit more 
    // // like checking the router and the name in the span.
    // it('responds properly to clicks with same scrollID', () => {
    //     wrapper.find('span').trigger('click')

    //     // assertions 
    //     expect(push.firstCall.args[0].params.scrollID).to.equal(33)
    //     expect(push.firstCall.args[0].params.scrollVersionID).to.equal(32)
    //     expect(push.firstCall.args[0].params.artID).to.equal(2)
    // })

    // beforeEach(() => {
    //     wrapper = mount(ArtefactMenuItem, {
    //         propsData: {
    //             artefactID: artID,
    //             scrollID: 33,
    //             imageID: imageID,
    //             scrollVersionID: 32,
    //             corpus: new Corpus(),
    //         },
    //         mocks: { 
    //             $router: { push },
    //             $route: {
    //                 params: { 
    //                     artID: 34,
    //                     scrollID: 33,
    //                     scrollVersionID: 32,
    //                 }
    //             }
    //         }
    //     })
    //     vm = wrapper.vm
    // })
    
    // it('responds properly to clicks with same scrollId and scrollVersionID', () => {
    //     wrapper.find('span').trigger('click')

    //     // assertions 
    //     expect(push.firstCall.args[0].params.scrollID).to.equal(33)
    //     expect(push.firstCall.args[0].params.scrollVersionID).to.equal(32)
    //     expect(push.firstCall.args[0].params.artID).to.equal(2)
    // })

    // beforeEach(() => {
    //     wrapper = mount(ArtefactMenuItem, {
    //         propsData: {
    //             artefactID: artID,
    //             scrollID: 33,
    //             imageID: 35,
    //             scrollVersionID: 32,
    //             corpus: new Corpus(),
    //         },
    //         mocks: { 
    //             $router: { push },
    //             $route: {
    //                 params: { 
    //                     artID: 34,
    //                     scrollID: 33,
    //                     scrollVersionID: 32,
    //                     imageID: 35
    //                 }
    //             }
    //         }
    //     })
    //     vm = wrapper.vm
    // })
    
    // it('responds properly to clicks with same scrollID, scrollVersionID, and imageID', () => {
    //     wrapper.find('span').trigger('click')

    //     // assertions 
    //     expect(push.firstCall.args[0].params.scrollID).to.equal(33)
    //     expect(push.firstCall.args[0].params.scrollVersionID).to.equal(32)
    //     expect(push.firstCall.args[0].params.artID).to.equal(2)
    // })
})