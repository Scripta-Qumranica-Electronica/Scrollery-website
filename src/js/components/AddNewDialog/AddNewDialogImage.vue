<template>
  <div>
    <image-menu
      :corpus="corpus"
      :images="images"
      :imageSettings="imageSettings"
      :artefact="artefact"
      :zoom="zoom"
      :viewMode="'ART'"
      :artefact-editable="false"
      :roi-editable="false"
      v-on:opacity="setOpacity"
      v-on:visible="toggleVisible"
      v-on:toggleMask="toggleMask"
      v-on:changeZoom="changeZoom">
    </image-menu>
    <div class="add-dialog-image-container">
      <roi-canvas 
                  v-if="masterImage"
                  class="overlay-image"
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
  </div>
</template>

<script>
import ImageMenu from '~/components/ImageMenu.vue'
import RoiCanvas from '~/components/RoiCanvas.vue'

export default {
  components: {
    imageMenu: ImageMenu,
    roiCanvas: RoiCanvas,
  },
  props: {
    imageReference: undefined,
    artefact: undefined,
    scroll_version_id: undefined,
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
  methods: {
    setOpacity(idx, val) {
      this.$set(this.imageSettings[idx], 'opacity', val)
    },
    toggleVisible(idx) {
      this.$set(this.imageSettings[idx], 'visible', !this.imageSettings[idx].visible)
    },
    toggleMask() {
      if (
        this.corpus.artefacts.get(this.artefact, this.scroll_version_id) &&
        this.corpus.artefacts.get(this.artefact, this.scroll_version_id).mask
      ) {
        this.clippingOn = !this.clippingOn
      }
    },
    changeZoom(value) {
      this.zoom = value
    },
  },
  computed: {
    images() {
      return this.corpus.imageReferences.get(this.imageReference).images
    },
    mask() {
      return this.artefact
        ? this.corpus.artefacts.get(this.artefact, this.scroll_version_id).mask
        : undefined
    },
    masterImage() {
      const reference = this.artefact
        ? this.corpus.artefacts.get(this.artefact, this.scroll_version_id).image_catalog_id
        : this.imageReference
      let master = undefined
      for (let i = 0, image; (image = this.corpus.imageReferences.get(reference).images[i]); i++) {
        this.$set(this.imageSettings, image, { visible: false, opacity: 1.0 })
        if (!master && this.corpus.images.get(image).is_master) {
          master = this.corpus.images.get(image)
          this.$set(this.imageSettings, image, { visible: true, opacity: 1.0 })
        }
      }
      return master
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~sass-vars';
.add-dialog-image-container {
  width: 100%;
  height: calc(65vh - 32px);
  overflow: auto;
  position: relative;
}
.overlay-image {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
}
</style>
