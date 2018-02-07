"use strict"

import { mount } from '@test'
import Login from '~/components/Login.vue'

describe("Login", function() {
    let wrapper, vm

    beforeEach(() => {
      wrapper = mount(Login)
      vm = wrapper.vm
    })

    it('has a button', () => {
      expect(wrapper.contains('button')).to.equal(true)
    })

    it('has a select dropdown', () => {
      expect(wrapper.contains('select')).to.equal(true)
    })

    it('has the initial language set to English', () => {
      expect(vm.language).to.equal('en')
    })
})