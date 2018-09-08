'use strict'

import { mount } from '@test'
import AddNewCombinationMenu from '~/components/AddNewDialog/AddNewCombinationMenu.vue'
import Corpus from '../../../.utils/factories/Corpus-factory.js'

describe('AddNewCombinationMenu', function() {
  let wrapper, vm
  const corpus = Corpus()
  const combination = corpus.combinations.get(corpus.combinations.keys()[0])
  const push = sinon.spy()
  beforeEach(() => push.reset())

  describe('display of combinations', () => {
    beforeEach(() => {
      wrapper = mount(AddNewCombinationMenu, {
        propsData: {
          selectedCombination: combination.scroll_version_id,
          corpus: corpus,
        },
      })
      vm = wrapper.vm
    })
    it('selects a combination', () => {
      vm.setCombination(vm.corpus.combinations.keys()[0])

      // assertions
      expect(vm.selectedCombination).to.equal(vm.corpus.combinations.keys()[0])
      expect(wrapper.emitted().setCombination[0][0]).to.equal(vm.corpus.combinations.keys()[0])
    })

    it('hides/shows combinations', () => {
      wrapper.find('div.hide-show-combinations').trigger('click')
      expect(vm.show).to.equal(false)
    })
  })
})
