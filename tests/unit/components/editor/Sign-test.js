import signFactory from './sign-factory.js'
import SignModel from '~/models/Sign.js'
import Sign from '~/components/editor/Sign.vue'
import editorStore from '~/components/editor/EditorStore.js'


const mocki18n = {
  str: key => key
}

describe('Sign.vue', () => {

  describe('reconstructed', () => {
    let model, state, wrapper, vm
    beforeEach(() => {

      // sign model
      model = new SignModel({
        id: 1,
        is_reconstructed: true
      }, new Map());

      // test wrapper
      state = editorStore(mocki18n);
      wrapper = signFactory({
        sign: model,
        state 
      })

      // component instance
      vm = wrapper.vm
    })

    it('should include complete class', () => {
      expect(vm.signClasses.complete).to.equal(false)
    })

    it('should include the reconstructed class appropriately reflecting the sign property' , () => {
      expect(vm.signClasses.reconstructed).to.equal(true)
    })

    it('should hide reconstructed text when local store specifies to hide reconstructed text', () => {
      expect(vm.signClasses.visible).to.equal(true)
      state.commit('hideReconstructedText')
      expect(vm.signClasses.visible).to.equal(false)
    })
  })

  describe('complete a.k.a. not reconstructed', () => {
    let model, state, wrapper, vm
    beforeEach(() => {

      // sign model
      model = new SignModel({
        id: 1,
        is_reconstructed: false
      }, new Map());

      // test wrapper
      state = editorStore(mocki18n);
      wrapper = signFactory({
        sign: model,
        state 
      })

      // component instance
      vm = wrapper.vm
    })

    it('should include complete class', () => {
      expect(vm.signClasses.complete).to.equal(true)
    })

    it('should include the reconstructed class appropriately reflecting the sign property', () => {
      expect(vm.signClasses.reconstructed).to.equal(false)
    })

    it('should continue to show the reconstructed text when local store specifies to hide reconstructed text', () => {
      expect(vm.signClasses.visible).to.equal(true)
      state.commit('hideReconstructedText')
      expect(vm.signClasses.visible).to.equal(true)
    })
  })

  describe('whitespace', () => {
    let model, state, wrapper, vm
    beforeEach(() => {

      // sign model
      model = new SignModel({
        id: 1,
        sign: '·'
      }, new Map());

      // test wrapper
      state = editorStore(mocki18n);
      wrapper = signFactory({
        sign: model,
        state 
      })

      // component instance
      vm = wrapper.vm
    })

    it('should know if it is a whitespace sign or not', () => {
      expect(vm.isWhitespace).to.equal(true)
    })
  })

  describe('fonts', () => {

    let model, state, wrapper, vm
    beforeEach(() => {

      // sign model
      model = new SignModel({
        id: 1
      }, new Map());

      // test wrapper
      state = editorStore(mocki18n);
      wrapper = signFactory({
        sign: model,
        state 
      })

      // component instance
      vm = wrapper.vm
    })
    
    it('should set its font class to the initial font', () => {
      let initial = vm.state.getters.font
      let classes = vm.signClasses
      
      expect(Object.keys(classes).indexOf(initial.class)).to.be.above(-1)
    })

    it('should respond to font changes by changing its class', () => {
      let fonts = vm.state.getters.fonts

      // fonts is an object, grab the first key off of it.
      // and change the font to that font in the store
      let fontName = Object.keys(fonts)[1];
      vm.state.commit('setFont', fontName)
      
      // expect that the sign has responded to that change
      expect(Object.keys(vm.signClasses).indexOf(fonts[fontName].class)).to.be.above(-1)
    })

  })

  describe('focus', () => {

    describe('not focused', () => {
      let model, state, wrapper, vm
      beforeEach(() => {
  
        // sign model
        model = new SignModel({
          id: 1,
          sign: 'א'
        }, new Map());
  
        // test wrapper
        state = editorStore(mocki18n);
        wrapper = signFactory({
          sign: model,
          state,
          focusedSignId: 2
        })
  
        // component instance
        vm = wrapper.vm
      })
  
      it('should set focus via a property', () => {
        expect(vm.signClasses.focused).to.equal(false)
      })
    })

    describe('has focus', () => {
      let model, state, wrapper, vm
      beforeEach(() => {
  
        // sign model
        model = new SignModel({
          id: 1,
          sign: 'א'
        }, new Map());
  
        // test wrapper
        state = editorStore(mocki18n);
        wrapper = signFactory({
          sign: model,
          state,
          focusedSignId: 1
        })
  
        // component instance
        vm = wrapper.vm
      })
  
      it('should set focus via a property', () => {
        expect(vm.signClasses.focused).to.equal(true)
      })
    })
  })

  describe('events', () => {

    describe('click', () => {

      let model, state, wrapper, vm
      beforeEach(() => {
  
        // sign model
        model = new SignModel({
          id: 1,
          sign: 'א'
        }, new Map());
  
        // test wrapper
        state = editorStore(mocki18n);
        wrapper = signFactory({
          sign: model,
          state
        })
  
        // component instance
        vm = wrapper.vm
      })

      it('should trigger a click event on the component', () => {
        let spy = sinon.spy(vm, '$emit')
        wrapper.trigger('click')

        expect(spy.called).to.equal(true)

        // ensure the event is emited with the Sign model
        expect(spy.firstCall.args[1]).to.equal(model)
      })
    })

  })
})