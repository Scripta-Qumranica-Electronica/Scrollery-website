"use strict"

import { mount } from '@vue/test-utils'
import App from '~/components/App.vue'

describe("Login", function() {
    let wrapper, vm

    beforeAll(() => {
      wrapper = mount(App)
      vm = wrapper.vm
    })

    it('has a button', () => {
      expect(wrapper.contains('button')).toBe(true)
    })

    it('has a select dropdown', () => {
      expect(wrapper.contains('select')).toBe(true)
    })

    it('has the initial language set to English', () => {
      expect(vm.language).toBe('en')
    })
})