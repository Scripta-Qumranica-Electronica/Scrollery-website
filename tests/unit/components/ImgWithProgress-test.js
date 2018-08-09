"use strict"

import { mount } from '@test'
import ImgWithProgress from '~/components/ImgWithProgress.vue'

describe("ImgWithProgress", function() {
  let wrapper, vm
  const push = sinon.spy()
  beforeEach(() => push.reset())

  describe("initial state", () => {
    beforeEach(() => {
      wrapper = mount(ImgWithProgress, {
        propsData: {
          url: 'http://fake.url',
          type: 'img',
        },
        mocks: {
            $get: { push }
        },
      })
      vm = wrapper.vm
    })
    
    it('displays something', () => {
      expect(wrapper.find('i').exists()).to.equal(true)
      expect(wrapper.find('span').exists()).to.equal(true)
      expect(vm.progress).to.equal(0)
      expect(vm.imageURL).to.equal(undefined)
    })
  })

  describe("load preview", () => {
    beforeEach(() => {
      const imgUrl = '../../.utils/testing-data/test_image.jpg'
      wrapper = mount(ImgWithProgress, {
        propsData: {
          url: imgUrl,
          type: 'img',
        },
        // mocks: {
        //     $get: { push }
        // },
      })
      vm = wrapper.vm
    })
    it('changes when done loading', () => {
      wrapper.setData({progress: 1})
      expect(wrapper.find('i').exists()).to.equal(false)
      expect(wrapper.find('span').exists()).to.equal(false)
      expect(vm.progress).to.equal(1)
      expect(vm.imageURL).to.equal(undefined)
    })
  })
})