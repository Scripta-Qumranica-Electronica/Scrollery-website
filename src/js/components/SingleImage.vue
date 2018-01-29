<template>
  <div style="{width: 100%; height: 100%;}">
    <div id="singleImageMenu" class="row align-middle">
      <el-select v-model="selectedImage" placeholder="Select">
        <el-option
          v-for="image in imageElements"
          :key="image.filename"
          :label="image.filename"
          :value="image.url + image.filename">
          <div class="row align-middle image-select-box">
            <span class="drag-handle col-1 image-select-entry" style="float: left">☰</span>
            <span class="col-3 image-select-entry">
              &nbsp;{{ image.start === image.end ? image.start : image.start + '–' + image.end}}nm
            </span>
            <span v-if="image.filename.indexOf('RRIR') !== -1" class="col-1 image-select-entry">&nbsp;RR</span>
            <span v-if="image.filename.indexOf('RLIR') !== -1" class="col-1 image-select-entry">&nbsp;RL</span>
            <input class="col-3 image-select-entry"
                    type="range" 
                    min="0" 
                    max="1.0" 
                    step="0.01" />
            <i class="fa fa-eye col-1 image-select-entry" style="color: green;"></i>
          </div>
        </el-option>
      </el-select>
      <input  class="col-2" 
                type="range" 
                min="0.5" 
                max="11.0" 
                step="0.1" 
                v-model="zoom" />
      <div id="seadragonNavCont" class="col-2">
        <div :id="navPanel"></div>
      </div>
    </div>
    <div style="{width: 100%; height: calc(100% - 50px);}">
      <open-seadragon 
        :tile-sources="filename"
        :ajax-with-credentials="false"
        :show-navigator="true"
        :home-fills-viewer="true"
        :pan-horizontal="false"
        :pan-vertical="false"
        :mouse-nav-enabled="false"
        :navigator-id="navPanel"
        :zoom="zoom">
      </open-seadragon>
    </div>
  </div>
    
</template>

<script>
import OpenSeadragon from './OpenSeadragon.vue'

export default {
  components: {
    'open-seadragon': OpenSeadragon,
  },
  data() {
    return {
      imageElements: [],
      selectedImageUrls: [],
      filename: '',
      navPanel: 'seadragonNavPanel',
      zoom: Number,
      selectedImage: undefined,
    }
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
                this.filename = `${res.data.results[0].url}${res.data.results[0].filename}/info.json`
            }
        })
      }
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
</style>
