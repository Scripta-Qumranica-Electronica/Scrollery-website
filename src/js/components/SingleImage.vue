<template>
  <div style="{width: 100%; height: 100%;}">
    <el-row id="singleImageMenu" :gutter="10" type="flex" justify="space-around">
      <el-col :span="10">
        <el-select class="image-select-entry" v-model="selectedImage" placeholder="Select" multiple>
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
      <el-col :span="6">
        <el-slider 
          v-model="zoom"
          :min="0.1"
          :step="0.01"
          :max="1.0"
          :format-tooltip="formatTooltip">
        </el-slider>
      </el-col>
      <el-col v-show="viewMode === 'ROI'" :span="4">
        <el-button @click="delSelectedRoi">Del ROI</el-button>
      </el-col>
      <el-col v-show="viewMode === 'ART'" :span="4">
        <el-button>Draw</el-button>
      </el-col>
      <el-col v-show="viewMode === 'ART'" :span="6">
        <el-slider>
        </el-slider>
      </el-col>
    </el-row>
    <div style="{width: 100%; height: calc(100% - 50px); overflow: auto; position: relative;}">
      <roi-canvas class="overlay-image"
                  :width="masterImage.width"
                  :height="masterImage.height"
                  :zoom-level="zoom"
                  :images="filenames"
                  ref="currentRoiCanvas">
      </roi-canvas>
      <!-- <artefact-canvas  v-show="viewMode === 'ART'"
                        :width="masterImage.width"
                        :height="masterImage.height"
                        :scale="zoom"
                        ref="currentArtCanvas">
      </artefact-canvas> -->
    </div>
  </div>
</template>

<script>
import RoiCanvas from './RoiCanvas.vue'
import ArtefactCanvas from './ArtefactCanvas.vue'

export default {
  components: {
    'roi-canvas': RoiCanvas,
    'artefact-canvas': ArtefactCanvas,
  },
  data() {
    return {
      imageElements: [],
      selectedImageUrls: [],
      filenames: [],
      masterImage: {},
      zoom: 0.5,
      scale: 0.2,
      selectedImage: undefined,
      viewMode: 'none',
    }
  },
  methods: {
    fetchImages(id) {
      this.$post('resources/cgi-bin/scrollery-cgi.pl', {
        transaction: 'imagesOfInstFragments',
        id: id,
      })
      .then(res => {
        if (res.status === 200 && res.data.results) {
          this.imageElements = res.data.results
          this.filenames = []
          res.data.results.forEach((result, index) => {
            if (result.is_master) {
              result.visible = true
              this.masterImage = result
            }
            result.opacity = 1.0
            this.filenames.push(result)
          })
          this.masterImage = this.masterImage ? this.masterImage : res.data.results[0]
          console.log(this.masterImage)
        }
      })
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
    formatTooltip(val) {
      return (this.zoom * 100).toFixed(2) + '%'
    }
  },
  watch: {
    '$route' (to, from) {
      if (
        to.params.artID !== '~' &&
        to.params.artID !== from.params.artID &&
        to.params.imageID === '~'
      ) {
        //set up ROI mode
        this.viewMode = 'ROI'
        this.fetchImages()
      } else if (
        to.params.imageID !== '~' &&
        to.params.imageID !== from.params.imageID &&
        to.params.artID === '~'
      ) {
        //set up Art mode
        this.viewMode = 'ART'
        this.fetchImages(to.params.imageID)
      }
    }
  },
  filters: {
    formatImageType(value) {
      if (!value) return ''
      let formattedString = value.start === value.end ? value.start : value.start + '–' + value.end
      if (value.type == 2) {
        formattedString += ' RL'
      } else if (value.type == 3) {
        formattedString += ' RR'
      }
      return formattedString
    }
  }
}
</script>

<style lang="scss" scoped>
  #singleImageMenu {
    width: 100%; 
    height: 50px; 
    max-height: 50px;
  }
  .fileSelector {
    border-radius: 15px;
    background: #E1E1D0;
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
</style>
