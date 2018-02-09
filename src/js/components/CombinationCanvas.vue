<template>
    <div :style="dimensions">
        <svg class="combination-canvas" 
            :width="scrollWidth" 
            :height="scrollHeight" 
            :viewBox="viewBox" 
            :transform="'translate(' + (scrollWidth / 2) * (globalScale - 1) 
            + ' ' + (scrollHeight / 2) * (globalScale - 1) 
            + ') scale(' + globalScale +  ')'"
            @mousemove="mousemove"
            @mousedown="mousedown"
            ref="svgCanvas">
            <artefact v-for="(artefact, index) in artefacts" 
                :key="'combination-art-' + artefact.id" 
                :artefact-data="artefact"
                :base-d-p-i="baseDPI"
                :index="index"
                ></artefact>
        </svg>
    </div>
</template>

<script>
import {geoJsonPolygonToSvg, geoJsonPointToSvg, geoJsonParseRect} from '../utils/VectorFactory'
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
        baseDPI: 1215,
        clickOrigin: undefined,
        selectedArtefactIndex: undefined,
        selectedArtefactLoc: undefined,
    }
  },
  computed: {
      canvasWidth() {
          return `${this.scrollWidth * this.globalScale}`
      },
      canvasHeight() {
          return `${this.scrollHeight * this.globalScale}`
      },
      viewBox() {
          return `0 0 ${this.scrollWidth} ${this.scrollHeight}`
      },
      dimensions() {
          return `width: ${this.canvasWidth}px; height: ${this.canvasHeight}px;`
      },
      svgCanvas() {
          return this.$refs['svgCanvas']
      }
  },
  methods: {
      setScrollDimensions(scrollID, versionID) {
        this.$post('resources/cgi-bin/GetImageData.pl', {
        transaction: 'getScrollWidth',
        scroll_id: scrollID,
        scroll_version_id: versionID,
        SESSION_ID: this.$store.getters.sessionID,
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
                this.artefacts.forEach(artefact => {
                    artefact.rect = geoJsonParseRect(artefact.rect)
                    artefact.poly = geoJsonPolygonToSvg(artefact.poly, artefact.rect)
                    console.log(artefact.poly)
                    artefact.pos = geoJsonPointToSvg(artefact.pos)
                })
            }
        })
      },
      mousedown(event) {
          if (event.target.nodeName === 'image') {
            this.selectedArtefactIndex = event.target.dataset.index
            this.selectedArtefactLoc = this.artefacts[this.selectedArtefactIndex].pos
            this.clickOrigin = this.pointInSvg(event.clientX, event.clientY)
            window.addEventListener('mouseup',this.mouseup); // Attach listener to window.
          }
      },
      mousemove(event) {
          if (this.clickOrigin && this.selectedArtefactIndex) {
              const currentLoc = this.pointInSvg(event.clientX, event.clientY)
              this.artefacts[this.selectedArtefactIndex].pos = {
                  x: this.selectedArtefactLoc.x + currentLoc.x - this.clickOrigin.x,
                  y: this.selectedArtefactLoc.y + currentLoc.y - this.clickOrigin.y
              }
          }
      },
      mouseup(event) {
        if (this.clickOrigin  && this.selectedArtefactIndex) {
            this.clickOrigin = this.selectedArtefactLoc = undefined
            window.removeEventListener('mouseup',this.mouseup);
            this.$post('resources/cgi-bin/GetImageData.pl', {
            transaction: 'setArtPosition',
            art_id: this.artefacts[this.selectedArtefactIndex].id,
            x: this.artefacts[this.selectedArtefactIndex].pos.x,
            y: this.artefacts[this.selectedArtefactIndex].pos.y,
            version_id: this.$route.params.scrollVersionID,
            SESSION_ID: this.$store.getters.sessionID
            })
            .then(res => {
                if (res.status === 200 && res.data.returned_info) {
                    this.artefacts[this.selectedArtefactIndex].id = res.data.returned_info
                    this.selectedArtefactIndex = undefined
                }
            })
          }
      },
      pointInSvg(x, y) {
        const pt = this.svgCanvas.createSVGPoint();
        pt.x = x;
        pt.y = y;
        return pt.matrixTransform(this.svgCanvas.getScreenCTM().inverse());
    },
  },
  watch: {
    '$route' (to, from) {
      if (to.params.scrollVersionID && to.params.scrollVersionID !== from.params.scrollVersionID) {
        this.artefacts = []
        this.setScrollDimensions(to.params.scrollID, to.params.scrollVersionID)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
    .combination-canvas {
        max-height: initial;
    }
</style>