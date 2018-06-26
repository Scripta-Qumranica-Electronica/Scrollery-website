<template>
  <div>
    <roi-canvas class="overlay-image"
                :width="masterImage.width ? masterImage.width : 0"
                :height="masterImage.height ? masterImage.height : 0"
                :zoom-level="zoom"
                :images="images"
                :image-settings="imageSettings"
                :divisor="imageShrink"
                :clipping-mask="mask"
                :clip="clippingOn"
                :corpus="corpus"
                ref="addArtefactSVG">
    </roi-canvas>
  </div>
</template>

<script>
import RoiCanvas from '~/components/RoiCanvas.vue'
export default {
  components: {
    roiCanvas: RoiCanvas,
  },
  props: {
    imageReference: undefined,
    artefact: undefined,
    corpus: undefined,
  },
  data() {
    return {
      zoom: 1,
      imageSettings: {},
      imageShrink: 2,
      clippingOn: false,
    }
  },
  methods: {},
  computed: {
    images() {
      return this.corpus.imageReferences.get(this.imageReference).images
    },
    mask() {
      return this.artefact ? this.corpus.artefacts.get(this.artefact).mask : undefined
    },
    masterImage() {
      const reference = this.artefact
        ? this.corpus.artefacts.get(this.artefact).image_catalog_id
        : this.imageReference
      let master = undefined
      for (let i = 0, image; (image = this.corpus.imageReferences.get(reference).images[i]); i++) {
        // this.imageSettings[image] = { visible: false, opacity: 1.0 }
        this.$set(this.imageSettings, image, { visible: false, opacity: 1.0 })
        if (!master && this.corpus.images.get(image).is_master) {
          master = this.corpus.images.get(image)
          this.$set(this.imageSettings, image, { visible: true, opacity: 1.0 })
        }
      }
      return master
    },
  },
  // watch: {
  //   imageReference(to, from) {

  //   },
  //   artefact(to, from) {

  //   }
  // }
}
</script>

<style lang="scss" scoped>
@import '~sass-vars';
</style>
