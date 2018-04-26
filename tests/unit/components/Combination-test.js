'use strict'

import { mount } from '@test'
import Combination from '~/components/Combination.vue'

describe("Combination", function() {

    let wrapper, vm
    beforeEach(() => {
      wrapper = mount(Combination, {
      })
    vm = wrapper.vm
  })

  it('calculates a proper scale', () => {
    expect(vm.globalScale).to.be.a('Number')
  })

  it('formats the scale tooltip', () => {
    expect(vm.formatTooltip(1)).to.be.a('string')
  })

  it('has a menu div', () => {
    expect(wrapper.contains('div el-row')).to.equal(true)
  })

  it('has a scale slider', () => {
    expect(wrapper.contains('div el-row el-col el-slider')).to.equal(true)
  })

  it('has a combination div', () => {
    expect(wrapper.contains('div.combination-panel-container')).to.equal(true)
  })
})
