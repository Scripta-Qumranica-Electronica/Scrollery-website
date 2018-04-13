<template>
  <div style="{width: 100%; height: 100%;}">
    <el-row class="single-image-pane-menu" :gutter="4" type="flex" justify="space-around">
      <el-col :span="8">
        <el-select class="image-select-entry" v-model="selectedImage" placeholder="Select" multiple size="mini">
          <el-option
            v-for="(image, index) in filenames"
            :key="'selector-' + image.filename"
            :label="image | formatImageType"
            :value="image | formatImageType">
            <el-row>
              <el-col :span="2">
                <span class="drag-handle image-select-entry" style="float: left">☰</span>
              </el-col>
              <el-col :span="8">
                <span class="image-select-entry">
                  &nbsp;{{image | formatImageType}}
                </span>
              </el-col>
              <el-col :span="10">
                  <input
                  class="image-select-entry"
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.01"
                  @input="setOpacity(index, $event.target.value)" />
              </el-col>
              <el-col :span="4">
                <i class="fa fa-eye image-select-entry"
                  :style="{color: image.visible ? 'green' : 'red'}"
                  @click="toggleVisible(index)">
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
                  :divisor="imageShrink"
                  :clipping-mask="clipMask"
                  :clip="clippingOn"
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
                        :mask = "firstClipMask"
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
      viewMode: 'ART',
      drawingMode: 'draw',
      brushCursorSize: 20,
      clipMask: undefined,
      firstClipMask: undefined,
      clippingOn: false,
      lock: true,
    }
  },
  methods: {
    fetchImages(id) {
      this.$post('resources/cgi-bin/scrollery-cgi.pl', {
        transaction: 'imagesOfInstFragments',
        id: id,
      }).then(res => {
        if (res.status === 200 && res.data.results) {
          this.imageElements = res.data.results
          this.filenames = []
          res.data.results.forEach(result => {
            if (result.is_master >>> 0) {
              result.visible = true
              this.masterImage = result
            }
            result.opacity = 1.0
            this.filenames.push(result)
          })
          this.masterImage = this.masterImage ? this.masterImage : res.data.results[0] // Is the ternary really necessary?
          // this.clipMask = undefined
          this.clipMask = this.clipMask ? this.clipMask : this.fullImageMask // this would catch edge cases, but may be unnecessary
        }
      })
    },
    fetchArtefactMask() {
      this.$post('resources/cgi-bin/scrollery-cgi.pl', {
        transaction: 'getArtefactMask',
        artID: this.artefact,
        scrollVersion: this.scrollVersionID,
      }).then(res => {
        if (res.status === 200 && res.data.results[0]) {
          this.firstClipMask = this.clipMask = wktPolygonToSvg(res.data.results[0].poly)
        }
      })
    },
    setClipMask(mask) {
      this.lock = true
      this.clipMask = mask
      if (this.artefact === 'new') {
        this.$post('resources/cgi-bin/scrollery-cgi.pl', {
          transaction: 'newArtefact',
          image_id: this.$route.params.imageID,
          region_in_master_image: svgPolygonToWKT(mask),
          name: this.artName,
          scroll_id: this.$route.params.scrollID,
          version_id: this.$route.params.scrollVersionID,
        }).then(res => {
          if (res.status === 200 && res.data.returned_info) {
            this.$router.push({
              name: 'workbenchAddress',
              params: {
                scrollID: this.$route.params.scrollID,
                scrollVersionID: this.$route.params.scrollVersionID,
                colID: this.$route.params.colID ? this.$route.params.colID : '~',
                imageID: this.$route.params.imageID ? this.$route.params.imageID : '~',
                artID: res.data.returned_info,
              },
            })
            this.lock = false
          }
        })
      } else {
        this.$post('resources/cgi-bin/scrollery-cgi.pl', {
          transaction: 'changeArtefactPoly',
          region_in_sqe_image: svgPolygonToWKT(mask),
          artefact_id: this.$route.params.artID,
          version_id: this.$route.params.scrollVersionID,
        }).then(res => {
          if (res.status === 200 && res.data.artefact_id) {
            this.$router.push({
              name: 'workbenchAddress',
              params: {
                scrollID: this.$route.params.scrollID,
                scrollVersionID: this.$route.params.scrollVersionID,
                colID: this.$route.params.colID ? this.$route.params.colID : '~',
                imageID: this.$route.params.imageID ? this.$route.params.imageID : '~',
                artID: res.data.artefact_id,
              },
            })
            this.lock = false
          }
        })
      }
    },
    toggleMask() {
      this.clippingOn = !this.clippingOn
    },
    delSelectedRoi() {
      this.$refs.currentRoiCanvas.deleteSelectedRoi()
    },
    setOpacity(idx, val) {
      this.$set(this.filenames[idx], 'opacity', val)
      this.$set(this.filenames, idx, this.filenames[idx])
    },
    toggleVisible(idx) {
      this.$set(this.filenames[idx], 'visible', !this.filenames[idx].visible)
      this.$set(this.filenames, idx, this.filenames[idx])
    },
    formatTooltip() {
      return (this.zoom * 100).toFixed(2) + '%'
    },
    toggleDrawingMode() {
      this.drawingMode = this.drawingMode === 'draw' ? 'erase' : 'draw'
    },
  },
  mounted() {
    // TODO maybe rethink this to avoid the case where
    // we have an artID but no imageID

    // Fetch image data if we have an imageID
    if (this.$route.params.imageID) {
      this.fetchImages(this.$route.params.imageID)
    }
    // Fetch artefact data if we have an artID
    if (this.$route.params.artID) {
      this.artefact = this.$route.params.artID
      this.scrollVersionID = this.$route.params.scrollVersionID
      this.fetchArtefactMask()
    }
  },
  watch: {
    $route(to, from) {
      // Fetch images for image ID if it has changed
      if (to.params.imageID !== '~' && to.params.imageID !== from.params.imageID) {
        this.fetchImages(to.params.imageID)
        this.artefact = undefined
        this.clipMask = undefined
        this.firstClipMask = undefined
      }

      // Load new artefact ID if there is one
      if (to.params.artID !== '~' && to.params.artID !== from.params.artID) {
        if (to.params.artID.toString().indexOf('name') !== -1) {
          this.viewMode = 'ART'
          this.artefact = 'new'
          this.artName = to.params.artID.split('name-')[1]
        } else {
          this.artefact = to.params.artID
          this.scrollVersionID = to.params.scrollVersionID
          this.fetchArtefactMask()
        }
        this.lock = false
      }
    },
  },
  filters: {
    formatImageType(value) {
      if (!value) return ''
      let formattedString = value.start === value.end ? value.start : value.start + '–' + value.end
      if (value.type >>> 0 == 2) {
        formattedString += ' RL'
      } else if (value.type >>> 0 == 3) {
        formattedString += ' RR'
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
