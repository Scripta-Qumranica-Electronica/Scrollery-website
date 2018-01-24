<template>
    <div :id="id" style="{width: 100%; height: 100%;}"></div>
</template>

<script>
import OpenSeadragon from 'openseadragon'

export default {
  props: {
    id: {
      type: String,
      default: 'openseadragon-viewer'
    },
    tileSources: {
      type: String,
      required: true
    },
    prefixUrl: {
      type: String,
      default: '../../../node_modules/openseadragon/build/openseadragon/images/'
    },
    maxZoomLevel: {
      type: Number
    },
    ajaxWithCredentials: {
      type: Boolean
    },
    showNavigator: {
      type: Boolean
    },
    homeFillsViewer: {
      type: Boolean
    },
    navigatorId: {
      type: String
    },
    toolbar: {
      type: String
    },
    zoomInButton: {
      type: String
    },
    zoomOutButton: {
      type: String
    },
    homeButton: {
      type: String
    },
    fullPageButton: {
      type: String
    },
    panHorizontal: {
      type: Boolean,
      default: true
    },
    panVertical: {
      type: Boolean,
      default: true
    },
    mouseNavEnabled: {
      type: Boolean,
      default: true
    }
  },
  components: {
  },
  data() {
    return {
      viewer: undefined
    }
  },
  computed: {
      seaDragonSettings() {
        return {
            id: this.id,
            tileSources: this.tileSources,
            prefixUrl: this.prefixUrl,
            ajaxWithCredentials: this.ajaxWithCredentials,
            showNavigator: this.showNavigator,
            homeFillsViewer: this.homeFillsViewer,
            panHorizontal: this.panHorizontal,
            panVertical: this.panVertical,
            mouseNavEnabled: this.mouseNavEnabled,
            ...this.maxZoomLevel && {maxZoomLevel: this.maxZoomLevel},
            ...this.navigatorId && {navigatorId: this.navigatorId},
            ...this.toolbar && {toolbar: this.toolbar},
            ...this.zoomInButton && {zoomInButton: this.zoomInButton},
            ...this.zoomOutButton && {zoomOutButton: this.zoomOutButton},
            ...this.homeButton && {homeButton: this.homeButton},
            ...this.fullPageButton && {fullPageButton: this.fullPageButton}
        }
      }
  },
  mounted() {
    this.setup()
  },
  watch: {
      tileSources(newVal, oldVal){
          if (newVal !== oldVal) {
              this.viewer.open(this.tileSources)
          }
      }
  },
  methods: {
    setup() {
        if (!this.viewer && this.seaDragonSettings) {
            this.viewer = OpenSeadragon(this.seaDragonSettings)
        }
    }
  }
}
</script>

<style lang="sass" scoped>
</style>