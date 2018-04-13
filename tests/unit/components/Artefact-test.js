'use strict'

import { mount } from '@test'
import Artefact from '~/components/Artefact.vue'

describe('Artefact', function() {
  let wrapper, vm
  const imgDPI = 400
  const baseDPI = 1215
  const correctScale = baseDPI / imgDPI
  const artefactID = 1
  beforeEach(() => {
    wrapper = mount(Artefact, {
      propsData: {
        artefactData: {
          dpi: imgDPI,
          matrix: [[1, 0, 0], [0, 1, 0]],
          id: artefactID,
          //Maybe in the future we put in a real image
          url: '',
          filename: '',
          suffix: '',
          rect: {
            x: 1,
            y: 1,
            width: 1,
            height: 1,
          },
          poly: 'M0,0 0,1 1,1 1,0 0,0',
        },
        baseDPI: baseDPI,
      },
    })
    vm = wrapper.vm
  })

  it('has the proper scale', () => {
    expect(vm.scale).to.equal(correctScale)
  })

  it('has an SVG g element', () => {
    expect(wrapper.contains('g')).to.equal(true)
  })

  it('has the proper SVG path', () => {
    expect(wrapper.contains('g > defs > path')).to.equal(true)
  })

  it('has the proper SVG clipPath', () => {
    expect(wrapper.contains(`g > defs > #clip${artefactID}`)).to.equal(true)
  })

  it('has the proper SVG clipPath use', () => {
    expect(wrapper.contains(`g > defs > #clip${artefactID} > use`)).to.equal(true)
  })

  it('has an SVG image element', () => {
    expect(wrapper.contains('g > image')).to.equal(true)
  })
})
