'use strict'

import { mount } from '@test'
import ImageCatalogPreview from '~/components/ImageCatalogPreview.vue'
import Corpus from '../../.utils/factories/Corpus-factory.js'

describe('ImageCatalogPreview', function() {
  let wrapper, vm
  const push = sinon.spy()
  const corpus = Corpus()
  const combination = corpus.combinations.get(corpus.combinations.keys()[0])
  const image = corpus.imageReferences.get(combination.imageReferences[0])
  beforeEach(() => push.reset())

  describe('load preview', () => {
    beforeEach(() => {
      wrapper = mount(ImageCatalogPreview, {
        propsData: {
          corpus: corpus,
          imageCatalogID: image.image_catalog_id,
          scrollVersionID: combination.scroll_version_id,
        },
      })
      vm = wrapper.vm
    })

    it('displays something', () => {
      expect(wrapper.find('span').exists()).to.equal(true)
    })
  })
})
