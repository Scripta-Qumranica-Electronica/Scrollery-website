// "use strict"

// import { mount } from '@test'
// import ColumnMenuItem from '~/components/menu/ColumnMenuItem.vue'

// describe("ColumnMenuItem", function() {
//     let wrapper, vm
//     const push = sinon.spy()
//     const scrollID = 2
//     const scrollVersionID = 2
//     const columnID = 2
//     const column = {
//         name: 'none'
//     }

//     beforeEach(() => {
//         wrapper = mount(ColumnMenuItem, {
//             propsData: {
//                 scrollID: 20,
//                 scrollVersionID: 324,
//                 columnID: 2,
//                 column: column,
//             },
//             mocks: { 
//                 $router: { push },
//                 $route: {
//                     params: { 
//                         scrollID: 20,
//                         scrollVersionID: 324,
//                         colID: 2,
//                     }
//                 },
//             }
//         })
//         vm = wrapper.vm
//     })
    
//     it('responds properly to clicks with no change', () => {
//         wrapper.find('span').trigger('click')

//         // assertions 
//         expect(push.firstCall.args[0].params.scrollID).to.equal(20)
//         expect(push.firstCall.args[0].params.scrollVersionID).to.equal(324)
//         expect(push.firstCall.args[0].params.colID).to.equal(2)
//     })

//     beforeEach(() => {
//         wrapper = mount(ColumnMenuItem, {
//             propsData: {
//                 scrollID: scrollID,
//                 scrollVersionID: scrollVersionID,
//                 columnID: columnID,
//                 column: column,
//             },
//             mocks: { 
//                 $router: { push },
//                 $route: {
//                     params: { 
//                         scrollID: 20,
//                         scrollVersionID: 324,
//                         colID: 23,
//                     }
//                 },
//             }
//         })
//         vm = wrapper.vm
//     })
    
//     it('responds properly to clicks with all changes', () => {
//         wrapper.find('span').trigger('click')

//         // assertions 
//         expect(push.firstCall.args[0].params.scrollID).to.equal(20)
//         expect(push.firstCall.args[0].params.scrollVersionID).to.equal(324)
//         expect(push.firstCall.args[0].params.colID).to.equal(2)
//     })

//     beforeEach(() => {
//         wrapper = mount(ColumnMenuItem, {
//             propsData: {
//                 scrollID: 20,
//                 scrollVersionID: scrollVersionID,
//                 columnID: columnID,
//                 column: column,
//             },
//             mocks: { 
//                 $router: { push },
//                 $route: {
//                     params: { 
//                         scrollID: 20,
//                         scrollVersionID: 324,
//                         colID: 23,
//                     }
//                 },
//             }
//         })
//         vm = wrapper.vm
//     })
    
//     it('responds properly to clicks with same scrollID', () => {
//         wrapper.find('span').trigger('click')

//         // assertions 
//         expect(push.firstCall.args[0].params.scrollID).to.equal(20)
//         expect(push.firstCall.args[0].params.scrollVersionID).to.equal(324)
//         expect(push.firstCall.args[0].params.colID).to.equal(2)
//     })

//     beforeEach(() => {
//         wrapper = mount(ColumnMenuItem, {
//             propsData: {
//                 scrollID: 20,
//                 scrollVersionID: 324,
//                 columnID: columnID,
//                 column: column,
//             },
//             mocks: { 
//                 $router: { push },
//                 $route: {
//                     params: { 
//                         scrollID: 20,
//                         scrollVersionID: 324,
//                         colID: 23,
//                     }
//                 },
//             }
//         })
//         vm = wrapper.vm
//     })
    
//     it('responds properly to clicks with same scrollID and scrollVersionID', () => {
//         wrapper.find('span').trigger('click')
        
//         // assertions 
//         expect(push.firstCall.args[0].params.scrollID).to.equal(20)
//         expect(push.firstCall.args[0].params.scrollVersionID).to.equal(324)
//         expect(push.firstCall.args[0].params.colID).to.equal(2)
//     })
// })
