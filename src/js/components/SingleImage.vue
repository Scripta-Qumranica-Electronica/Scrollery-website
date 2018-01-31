<template>
  <div style="{width: 100%; height: 100%;}">
    <div id="singleImageMenu" class="row align-middle">
      <el-select v-model="selectedImage" placeholder="Select" multiple>
        <el-option
          v-for="image in filenames"
          :key="'selector-' + image.filename"
          :label="image | formatImageType"
          :value="image | formatImageType">
          <div class="row align-middle image-select-box">
            <span class="drag-handle col-1 image-select-entry" style="float: left">☰</span>
            <span class="col-3 image-select-entry">
              &nbsp;{{image | formatImageType}}
            </span>
            <input class="col-3 image-select-entry"
                    type="range" 
                    min="0" 
                    max="1.0" 
                    step="0.01"
                    @input="image.opacity = $event.target.value" />
            <!-- <div class="block col-3">
              <el-slider v-model="image.opacity" 
                          min="0" 
                          max="1.0" 
                          step="0.01" 
                          :show-tooltip="false"></el-slider>
            </div> -->
            <i class="fa fa-eye col-1 image-select-entry" :style="{color: image.visible ? 'green' : 'red'}" @click="image.visible = !image.visible"></i>
          </div>
        </el-option>
      </el-select>
      <input  class="col-2" 
                type="range" 
                min="0.1" 
                max="1.0" 
                step="0.05" 
                v-model="zoom" />
      <!-- <div id="seadragonNavCont" class="col-2">
        <div :id="navPanel"></div>
      </div> -->
      <el-button @click="delSelectedRoi">Del ROI</el-button>
    </div>
    <div style="{width: 100%; height: calc(100% - 50px); overflow: auto; position: relative;}">
      <img v-for="filename in filenames" 
          :key="'img-' + filename.filename" 
          v-show="filename.visible"
          :src="filename.url + filename.filename + '/full/pct:20/0/default.jpg'" 
          class="overlay-image avoid-clicks"
          :style="{opacity: filename.opacity, transform: 'scale(' + zoom + ')'}"/>
      <roi-canvas class="overlay-image" 
                  :width="7215"
                  :height="5410"
                  :zoom-level="1.0"
                  ref="currentRoiCanvas"></roi-canvas>
      <!-- <open-seadragon 
        :tile-sources="filenames[0]"
        :ajax-with-credentials="false"
        :show-navigator="true"
        :home-fills-viewer="true"
        :pan-horizontal="false"
        :pan-vertical="false"
        :mouse-nav-enabled="false"
        :navigator-id="navPanel"
        :zoom="zoom"
        :translate-point="translatePoint">
      </open-seadragon> -->
    </div>
  </div>
    
</template>

<script>
// import OpenSeadragon from './OpenSeadragon.vue'
import RoiCanvas from './RoiCanvas.vue'

export default {
  components: {
    // 'open-seadragon': OpenSeadragon,
    'roi-canvas': RoiCanvas,
  },
  data() {
    return {
      imageElements: [],
      selectedImageUrls: [],
      filenames: [],
      navPanel: 'seadragonNavPanel',
      zoom: 1.0,
      translatePoint: {
        x: 0,
        y: 0,
      },
      selectedImage: undefined,
    }
  },
  methods: {
    delSelectedRoi() {
      this.$refs.currentRoiCanvas.deleteSelectedRoi()
    },
  },
  watch: {
    '$route' (to, from) {
      if (to.params.selectionType === 'col' && to.params.id !== from.params.id) {
        this.$post('resources/cgi-bin/GetImageData.pl', {
        transaction: 'imagesOfFragment',
        idType: 'composition',
        id: to.params.id,
        SESSION_ID: this.$store.getters.sessionID
      })
        .then(res => {
            if (res.status === 200 && res.data) {
                this.imageElements = res.data.results
                this.filenames = []
                res.data.results.forEach((result, index) => {
                  // this.filenames.push(`${result.url}${result.filename}/info.json`)
                  if (result.filename.indexOf('ColorCalData') !== -1) {
                    result.visible = true
                  }
                  result.opacity = 1.0
                  this.filenames.push(result)
                })
                // this.filename = `${res.data.results[0].url}${res.data.results[0].filename}/info.json`
            }
        })
      }
    }
  },
  filters: {
    formatImageType(value) {
      if (!value) return ''
      let formattedString = value.start === value.end ? value.start : value.start + '–' + value.end
      if (value.filename.indexOf('RRIR') !== -1) {
        formattedString += ' RR'
      } else if (value.filename.indexOf('RLIR') !== -1) {
        formattedString += ' RL'
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
#seadragonNavPanel {
  width: 50px; 
  height: 50px;
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
.overlay-image {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0.5;
}
</style>
