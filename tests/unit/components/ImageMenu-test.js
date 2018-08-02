import { mount } from '@test'
import ImageMenu from '~/components/ImageMenu.vue'
import Corpus from '../../.utils/factories/Corpus-factory.js'

describe('ImageMenu', () => {
  let wrapper, vm
  const push = sinon.spy()
  const corpus = new Corpus()
  const combination = corpus.combinations.get(corpus.combinations.keys()[0])
  const image = corpus.imageReferences.get(combination.imageReferences[0])
  const artefact = image.artefacts[0]
  let imageSettings = {}

  for (let i = 0, entry; (entry = image.images[i]); i++) {
    imageSettings[entry] =
      i === 0 ? { visible: true, opacity: 1.0 } : { visible: false, opacity: 1.0 }
  }

  describe('change controls', () => {
    beforeEach(() => {
      wrapper = mount(ImageMenu, {
        propsData: {
          corpus: corpus,
          images: image.images,
          artefact: artefact,
          zoom: 0.1,
          viewMode: 'ART',
          artefactEditable: true,
          roiEditable: false,
          brushCursorSize: 20,
          imageSettings: imageSettings
        }
      })
      vm = wrapper.vm
    })

    it('should change the brush size', () => {
      const newBrushSize = 40
      expect(vm.changeBrushSize).to.equal(20)
      vm.changeBrushSize = newBrushSize
      expect(wrapper.emitted().changeBrushSize[0][0]).to.equal(newBrushSize)
    })

    it('should change the view mode', () => {
      const newViewMode = 'ROI'
      expect(vm.changeViewMode).to.equal('ART')
      vm.changeViewMode = newViewMode
      expect(wrapper.emitted().changeViewMode[0][0]).to.equal(newViewMode)
    })

    it('should change the zoom', () => {
      const newZoom = 0.8
      expect(vm.changeZoom).to.equal(0.1)
      vm.changeZoom = newZoom
      expect(wrapper.emitted().changeZoom[0][0]).to.equal(newZoom)
    })

    it('should set opacity', () => {
      const selectedImage = image.images[0]
      const selectedOpacity = 0.75
      vm.setOpacity(selectedImage, selectedOpacity)
      expect(wrapper.emitted().opacity[0]).to.deep.equal([selectedImage, selectedOpacity])
    })

    it('should toggle visibility', () => {
      const selectedImage = image.images[0]
      vm.toggleVisible(selectedImage)
      expect(wrapper.emitted().visible[0][0]).to.equal(selectedImage)
    })

    it('should format the tooltip', () => {
      expect(vm.formatTooltip()).to.equal('10.00%')
    })

    it('should toggle drawing mode', () => {
      expect(vm.drawingMode).to.equal('draw')
      vm.toggleDrawingMode()
      expect(vm.drawingMode).to.equal('erase')
      expect(wrapper.emitted().drawingMode[0]).to.deep.equal([])
      vm.toggleDrawingMode()
      expect(vm.drawingMode).to.equal('draw')
      expect(wrapper.emitted().drawingMode[0]).to.deep.equal([])
    })

    it('should toggle the mask', () => {
      vm.toggleMask()
      expect(wrapper.emitted().toggleMask[0]).to.deep.equal([])
    })

    it('should delete the current ROI', () => {
      vm.delSelectedRoi()
      expect(wrapper.emitted().delSelectedRoi[0]).to.deep.equal([])
    })

    it('should toggle fullscreen mode', () => {
      vm.toggleFullscreen()
      expect(wrapper.emitted().fullscreen[0]).to.deep.equal([])
    })
  })
})
