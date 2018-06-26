<template>
  <el-row class="single-image-pane-menu" :gutter="4" type="flex" justify="space-around">
    <el-col :span="8">
      <el-select class="image-select-entry" v-model="selectedImage" placeholder="Select Images" multiple size="mini">
        <el-option
          v-for="image of images"
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
        v-model="changeZoom"
        :min="0.1"
        :step="0.01"
        :max="1.0"
        :format-tooltip="formatTooltip">
      </el-slider>
    </el-col>
    <el-col v-show="artefact && artefact !== 'new'"  :span="5">
      <el-radio-group v-model="changeViewMode" size="mini">
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
        v-model="changeBrushSize"
        :min="0"
        :max="200"
        :step="1">
      </el-slider>
    </el-col>
  </el-row>
</template>

<script>
export default {
  props: {
    corpus: undefined,
    images: undefined,
    imageSettings: undefined,
    artefact: undefined,
    zoom: undefined,
    viewMode: undefined,
    brushCursorSize: undefined,
  },
  data() {
    return {
      drawingMode: 'draw',
      selectedImage: '',
    }
  },
  computed: {
    changeBrushSize: {
      get() {
        return this.brushCursorSize
      },
      set(val) {
        this.$emit('changeBrushSize', val)
      },
    },
    changeViewMode: {
      get() {
        return this.viewMode
      },
      set(val) {
        this.$emit('changeViewMode', val)
      },
    },
    changeZoom: {
      get() {
        return this.zoom
      },
      set(val) {
        this.$emit('changeZoom', val)
      },
    },
  },
  methods: {
    setOpacity(image, value) {
      this.$emit('opacity', image, value)
    },
    toggleVisible(image) {
      this.$emit('visible', image)
    },
    formatTooltip() {
      return (this.zoom * 100).toFixed(2) + '%'
    },
    toggleDrawingMode() {
      this.$emit('drawingMode')
      this.drawingMode = this.drawingMode === 'draw' ? 'erase' : 'draw'
    },
    toggleMask() {
      this.$emit('toggleMask')
    },
    delSelectedRoi() {
      this.$emit('delSelectedRoi')
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
.single-image-pane-menu {
  width: 100%;
  height: 32px; // Should be 30px, but 32px looks better
  max-height: 32px; // Should be 30px, but 32px looks better
  background: #dedede;
  margin-left: 0px !important; // Not sure why I have to do this, there is bleed through somewhere.
  margin-right: 0px !important; // Not sure why I have to do this, there is bleed through somewhere.
}
.image-select-entry {
  width: 100%;
}
</style>
