<template>
    <div :style="dimensions">
        <svg id="combination-canvas" :viewBox="viewBox">
            <artefact v-for="artefact in artefacts" 
                :key="artefact.id" 
                :artefact-data="artefact"
                :scale-factor="globalScale"></artefact>
        </svg>
    </div>
</template>

<script>
import Artefact from './Artefact.vue'

export default {
  props: {
    globalScale:{
            type: Number,
            default: 1.0,
        },
  },
  components: {
      'artefact': Artefact
  },
  data() {
    return {
        scrollWidth: 10000,
        scrollHeight: 1500,
        artefacts: [],
    }
  },
  computed: {
      combCanvasStyle(){
          return {
              width: `${this.scrollWidth * this.globalScale}px`,
              height: `${this.scrollHeight * this.globalScale}px`,
              background: 'maroon',
          }
      },
      canvasWidth() {
          return `${this.scrollWidth * this.globalScale}px`
      },
      canvasHeight() {
          return `${this.scrollHeight * this.globalScale}px`
      },
      viewBox() {
          return `0 0 ${this.scrollWidth * this.globalScale} ${this.scrollHeight * this.globalScale}`
      },
      dimensions() {
          return `width: ${this.scrollWidth * this.globalScale}px; height: ${this.scrollHeight * this.globalScale}px;`
      }
  },
  methods: {
      setScrollDimensions(scrollID, versionID) {
        this.$post('resources/cgi-bin/GetImageData.pl', {
        transaction: 'getScrollWidth',
        scroll_id: scrollID,
        scroll_version_id: versionID,
        SESSION_ID: this.$store.getters.sessionID
        })
        .then(res => {
            if (res.status === 200 && res.data.results) {
                this.scrollWidth = res.data.results[0].max_x
            }
        })

        this.$post('resources/cgi-bin/GetImageData.pl', {
        transaction: 'getScrollHeight',
        scroll_id: scrollID,
        scroll_version_id: versionID,
        SESSION_ID: this.$store.getters.sessionID
        })
        .then(res => {
            if (res.status === 200 && res.data.results) {
                this.scrollHeight = res.data.results[0].max_y
            }
        })
        this.loadFragments(scrollID, versionID)
      },
      loadFragments(scrollID, versionID) {
          this.$post('resources/cgi-bin/GetImageData.pl', {
        transaction: 'getScrollArtefacts',
        scroll_id: scrollID,
        scroll_version_id: versionID,
        SESSION_ID: this.$store.getters.sessionID
        })
        .then(res => {
            if (res.status === 200 && res.data.results) {
                this.artefacts = res.data.results
            }
        })
      },
  },
  watch: {
    '$route' (to, from) {
      if (to.params.scrollVersionID && to.params.scrollVersionID !== from.params.scrollVersionID) {
        this.setScrollDimensions(to.params.scrollID, to.params.scrollVersionID)
      }
    }
  }
}
</script>

<style lang="sass" scoped>

</style>