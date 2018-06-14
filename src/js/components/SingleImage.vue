<template>
  <div style="{width: 100%; height: 100%;}">
    <!-- TODO move menu into its own component -->
    <el-row class="single-image-pane-menu" :gutter="4" type="flex" justify="space-around">
      <el-col :span="8">
        <el-select class="image-select-entry" v-model="selectedImage" placeholder="Select" multiple size="mini">
          <el-option
            v-for="image of filenames"
            :key="'selector-' + corpus.images.get(image).filename"
            :label="corpus.images.get(image).type | formatImageType"
            :value="image">
            <el-row>
              <el-col :span="2">
                <span class="drag-handle image-select-entry" style="float: left">☰</span>
              </el-col>
              <el-col :span="8">
                <span class="image-select-entry">
                  &nbsp;{{corpus.images.get(image).type | formatImageType}}
                </span>
              </el-col>
              <el-col :span="10">
                  <input
                  class="image-select-entry"
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.01"
                  @input="setOpacity(image, $event.target.value)" />
              </el-col>
              <el-col :span="4">
                <i class="fa fa-eye image-select-entry"
                  :style="{color: imageSettings[image].visible ? 'green' : 'red'}"
                  @click="toggleVisible(image)">
                </i>
              </el-col>
            </el-row>
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="2">
        <el-slider
          v-model="zoom"
          :min="0.1"
          :step="0.01"
          :max="1.0"
          :format-tooltip="formatTooltip">
        </el-slider>
      </el-col>
      <el-col v-show="artefact && artefact !== 'new'"  :span="5">
        <el-radio-group v-model="viewMode" size="mini">
          <el-radio-button label="ROI">{{$i18n.str('ROI')}}</el-radio-button>
          <el-radio-button label="ART">{{$i18n.str('ART')}}</el-radio-button>
        </el-radio-group>
      </el-col>
      <el-col v-show="artefact || artefact === 'new'"  :span="3">
        <el-button @click="toggleMask" size="mini">Mask</el-button>
      </el-col>
      <el-col v-show="viewMode === 'ROI' && artefact" :span="3">
        <el-button @click="delSelectedRoi" size="mini">Del ROI</el-button>
      </el-col>
      <el-col v-show="viewMode === 'ART' && (artefact || artefact === 'new')" :span="3">
        <el-button
                @click="toggleDrawingMode"
                :type="drawingMode === 'draw' ? 'primary' : 'warning'"
                size="mini">
          {{drawingMode === 'draw' ? 'Draw' : 'Erase'}}
        </el-button>
      </el-col>
      <el-col v-show="viewMode === 'ART' && (artefact || artefact === 'new')" :span="3">
        <el-slider
          v-model="brushCursorSize"
          :min="0"
          :max="200"
          :step="1">
        </el-slider>
      </el-col>
    </el-row>
    <div style="{width: 100%; height: calc(100% - 30px); overflow: auto; position: relative;}">
      <roi-canvas class="overlay-image"
                  :width="masterImage.width ? masterImage.width : 0"
                  :height="masterImage.height ? masterImage.height : 0"
                  :zoom-level="zoom"
                  :images="filenames"
                  :image-settings="imageSettings"
                  :divisor="imageShrink"
                  :clipping-mask="$route.params.artID === '~' || !corpus.artefacts.get($route.params.artID) ? undefined : corpus.artefacts.get($route.params.artID).mask"
                  :clip="clippingOn"
                  :corpus="corpus"
                  ref="currentRoiCanvas">
      </roi-canvas>
      <artefact-canvas  class="overlay-canvas"
                        v-show="viewMode === 'ART'"
                        :width="masterImage.width ? masterImage.width / 2 : 0"
                        :height="masterImage.height ? masterImage.height / 2 : 0"
                        :scale="zoom"
                        :draw-mode="drawingMode"
                        :brush-size="brushCursorSize"
                        :divisor="imageShrink"
                        :mask="$route.params.artID === '~' || !corpus.artefacts.get($route.params.artID) ? undefined : corpus.artefacts.get($route.params.artID).mask"
                        :locked="lock"
                        v-on:mask="setClipMask"
                        ref="currentArtCanvas">
      </artefact-canvas>
    </div>
  </div>
</template>

<script>
import RoiCanvas from './RoiCanvas.vue'
import ArtefactCanvas from './ArtefactCanvas.vue'
import { wktPolygonToSvg, svgPolygonToWKT } from '../utils/VectorFactory'

export default {
  props: {
    corpus: {
      required: true,
      type: Object,
    },
  },
  components: {
    'roi-canvas': RoiCanvas,
    'artefact-canvas': ArtefactCanvas,
  },
  data() {
    return {
      scrollVersionID: undefined,
      imageElements: [],
      selectedImageUrls: [],
      filenames: [],
      masterImage: {},
      imageShrink: 2,
      artefact: undefined,
      artName: '',
      zoom: 0.5,
      scale: 0.2,
      selectedImage: undefined,
      viewMode: 'NONE',
      drawingMode: 'draw',
      brushCursorSize: 20,
      clipMask: undefined,
      firstClipMask: undefined,
      clippingOn: false,
      lock: true,
      imageSettings: {},
    }
  },
  methods: {
    fetchImages(id) {
      this.$store.commit('addWorking')
      this.corpus
        .populateImagesOfImageReference(id, this.$route.params.scrollVersionID)
        .then(res => {
          this.$store.commit('delWorking')
          this.filenames = this.corpus.imageReferences.get(id >>> 0).images
          this.filenames.forEach(key => {
            if (this.corpus.images.get(key).is_master) {
              this.$set(this.imageSettings, key, { visible: true, opacity: 1.0 })
              this.masterImage = this.corpus.images.get(key)
            } else {
              this.$set(this.imageSettings, key, { visible: false, opacity: 1.0 })
            }
          })
          this.$store.commit('addWorking')
          this.corpus
            .populateArtefactsOfImageReference(id, this.$route.params.scrollVersionID)
            .then(res1 => {
              this.$store.commit('delWorking')
            })
        })
    },
    // TODO move the logic for this into the data model.
    setClipMask(mask) {
      this.corpus.changeArtefactMask(
        mask,
        this.corpus.artefacts.get(this.$route.params.artID).artefact_position_id,
        this.$route.params.scrollVersionID
      )
    },
    toggleMask() {
      if (
        this.corpus.artefacts.get(this.$route.params.artID) &&
        this.corpus.artefacts.get(this.$route.params.artID).mask
      ) {
        this.clippingOn = !this.clippingOn
      }
    },
    delSelectedRoi() {
      this.$refs.currentRoiCanvas.deleteSelectedRoi()
    },
    setOpacity(idx, val) {
      this.$set(this.imageSettings[idx], 'opacity', val)
    },
    toggleVisible(idx) {
      this.$set(this.imageSettings[idx], 'visible', !this.imageSettings[idx].visible)
    },
    formatTooltip() {
      return (this.zoom * 100).toFixed(2) + '%'
    },
    toggleDrawingMode() {
      this.drawingMode = this.drawingMode === 'draw' ? 'erase' : 'draw'
    },
  },
  watch: {
    $route(to, from) {
      // TODO maybe rethink this to avoid the case where
      // we have an artID but no imageID

      // Fetch images for image ID if it has changed
      if (to.params.imageID !== '~' && to.params.imageID !== from.params.imageID) {
        this.fetchImages(this.$route.params.imageID)
        this.artefact = undefined
        this.firstClipMask = this.clipMask = undefined
        if (to.params.artID === '~') {
          this.clippingOn = false
        }
      }

      // Load new artefact ID if there is one
      if (to.params.artID !== '~' && to.params.artID !== from.params.artID) {
        this.viewMode = 'ART'
        if (to.params.artID.toString().indexOf('name') !== -1) {
          this.artefact = 'new'
          this.artName = to.params.artID.split('name-')[1]
        } else {
          this.artefact = to.params.artID >>> 0
          this.scrollVersionID = to.params.scrollVersionID >>> 0
          // if (this.corpus.artefacts.get(this.artefact).mask === '') {
          //   // this.$store.commit('addWorking')
          //   this.corpus.artefacts
          //     .fetchMask(to.params.scrollVersionID, to.params.artID)
          //     .then(res => {
          //       // this.$store.commit('delWorking')
          //       this.firstClipMask = this.clipMask = wktPolygonToSvg(
          //         this.corpus.artefacts.get(this.artefact).mask
          //       )
          //     })
          // } else {
          this.firstClipMask = this.clipMask = wktPolygonToSvg(
            this.corpus.artefacts.get(this.artefact).mask
          )
          // }
        }
        this.lock = false
      }
    },
  },
  filters: {
    formatImageType(value) {
      let formattedString = ''
      switch (value) {
        case 0:
          formattedString += 'Full Color'
          break
        case 1:
          formattedString += '940nm'
          break
        case 2:
          formattedString += '940nm RL'
          break
        case 3:
          formattedString += '940nm RR'
          break
      }
      return formattedString
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~sass-vars';

.single-image-pane-menu {
  width: 100%;
  height: 32px; // Should be 30px, but 32px looks better
  max-height: 32px; // Should be 30px, but 32px looks better
  background: #dedede;
  margin-left: 0px !important; // Not sure why I have to do this, there is bleed through somewhere.
  margin-right: 0px !important; // Not sure why I have to do this, there is bleed through somewhere.
}
.fileSelector {
  border-radius: 15px;
  background: #e1e1d0;
  padding: 10px;
  z-index: 10;
}
.image-select-box > .image-select-entry {
  padding: 5px;
}
.image-select-entry {
  width: 100%;
}
.overlay-image {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
}
.overlay-canvas {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
}
</style>
