<template>
    <div :style="dimensions">
        <svg
            v-if="corpus.combinations.get(scrollVersionID)" 
            class="combination-canvas"
            :viewBox="viewBox"
            @mousemove="mousemove"
            @mousedown="mousedown"
            ref="svgCanvas">
            <artefact v-for="artefact of corpus.combinations.get(scrollVersionID).artefacts"
                v-if="corpus.combinations.get(scrollVersionID) && corpus.artefacts.get(artefact)"
                :key="'combination-art-' + artefact" 
                :artefact="corpus.artefacts.get(artefact)"
                :base-d-p-i="baseDPI"
                :images="corpus.imageReferences.get(corpus.artefacts.get(artefact).image_catalog_id).images"
                :corpus="corpus"
                :index="artefact"
                ></artefact>
        </svg>
    </div>
</template>

<script>
/**
 * TODO add unit tests and remove istanbul ignore next
 * as this is prepared for release (end of September 2018).
 */
import { svgMatrixToDB } from '~/utils/VectorFactory'
import Artefact from './Artefact.vue'
// I will use the rematrix package to directly apply
// rotation to existing artefact matrices.
import * as Rematrix from 'rematrix'
export default {
  props: {
    globalScale: {
      type: Number,
      default: 1.0,
    },
    corpus: {
      type: Object,
    },
  },
  components: {
    artefact: Artefact,
  },
  data /* istanbul ignore next */() {
    return {
      scrollWidth: 10000,
      scrollHeight: 1500,
      artefacts: [],
      baseDPI: 1215,
      clickOrigin: undefined,
      selectedArtefactIndex: undefined,
      selectedArtefactLoc: undefined,
      scrollVersionID: undefined,
    }
  },
  computed: {
    canvasWidth /* istanbul ignore next */() {
      return `${this.scrollWidth * this.globalScale}`
    },
    canvasHeight /* istanbul ignore next */() {
      return `${this.scrollHeight * this.globalScale}`
    },
    viewBox /* istanbul ignore next */() {
      return `0 0 ${this.scrollWidth} ${this.scrollHeight}`
    },
    dimensions /* istanbul ignore next */() {
      return `width: ${this.canvasWidth}px; height: ${this.canvasHeight}px;`
    },
    svgCanvas /* istanbul ignore next */() {
      return this.$refs['svgCanvas']
    },
  },
  methods: {
    setScrollDimensions(scrollID, versionID) {
      /* istanbul ignore next */

      this.$post('resources/cgi-bin/scrollery-cgi.pl', {
        transaction: 'getScrollWidth',
        scroll_id: scrollID,
        scroll_version_id: versionID,
      }).then(res => {
        if (res.status === 200 && res.data.results) {
          this.scrollWidth = res.data.results[0].max_x
        }
      })
      /* istanbul ignore next */

      this.$post('resources/cgi-bin/scrollery-cgi.pl', {
        transaction: 'getScrollHeight',
        scroll_id: scrollID,
        scroll_version_id: versionID,
      }).then(res => {
        if (res.status === 200 && res.data.results) {
          this.scrollHeight = res.data.results[0].max_y
        }
      })
    },
    // TODO: I need to now rewrite these mouselistener functions
    // to work with the new model system.
    mousedown(event) {
      /* istanbul ignore next */

      if (event.target.nodeName === 'image') {
        this.selectedArtefactIndex = event.target.dataset.index
        this.selectedArtefactLoc = this.artefacts[this.selectedArtefactIndex].matrix
        this.clickOrigin = this.pointInSvg(event.clientX, event.clientY)
        window.addEventListener('mouseup', this.mouseup) // Attach listener to window.
      }
    },
    mousemove(event) {
      /* istanbul ignore next */

      if (this.clickOrigin && this.selectedArtefactIndex) {
        const currentLoc = this.pointInSvg(event.clientX, event.clientY)
        this.artefacts[this.selectedArtefactIndex].matrix = [
          this.selectedArtefactLoc[0],
          this.selectedArtefactLoc[1],
          this.selectedArtefactLoc[2],
          this.selectedArtefactLoc[3],
          this.selectedArtefactLoc[4] + currentLoc.x - this.clickOrigin.x,
          this.selectedArtefactLoc[5] + currentLoc.y - this.clickOrigin.y,
        ]
      }
    },
    mouseup(event) {
      /* istanbul ignore next */

      if (this.clickOrigin && this.selectedArtefactIndex) {
        this.clickOrigin = this.selectedArtefactLoc = undefined
        window.removeEventListener('mouseup', this.mouseup)
        this.$post('resources/cgi-bin/scrollery-cgi.pl', {
          transaction: 'setArtPosition',
          art_id: this.artefacts[this.selectedArtefactIndex].id,
          matrix: svgMatrixToDB(this.artefacts[this.selectedArtefactIndex].matrix),
          version_id: this.$route.params.scrollVersionID,
        }).then(res => {
          if (res.status === 200 && res.data.returned_info) {
            this.artefacts[this.selectedArtefactIndex].id = res.data.returned_info
            this.selectedArtefactIndex = undefined
          }
        })
      }
    },
    pointInSvg(x, y) {
      /* istanbul ignore next */

      const pt = this.svgCanvas.createSVGPoint()
      /* istanbul ignore next */

      pt.x = x
      /* istanbul ignore next */

      pt.y = y
      /* istanbul ignore next */

      return pt.matrixTransform(this.svgCanvas.getScreenCTM().inverse())
    },
  },
  watch: {
    $route(to, from) {
      /* istanbul ignore next */

      if (
        to.params.scrollVersionID !== '~' &&
        to.params.scrollID !== '~' &&
        (to.params.scrollVersionID !== from.params.scrollVersionID ||
          to.params.scrollID !== from.params.scrollID)
      ) {
        this.scrollVersionID = to.params.scrollVersionID >>> 0
        this.setScrollDimensions(to.params.scrollID, to.params.scrollVersionID)
        this.$store.commit('addWorking')
        this.corpus
          .populateImageReferencesOfCombination(to.params.scrollID, to.params.scrollVersionID)
          .then(res => {
            this.$store.commit('delWorking')
            this.$store.commit('addWorking')
            this.corpus
              .populateImagesOfImageReference(
                this.corpus.combinations.get(this.scrollVersionID).imageReferences,
                this.scrollVersionID
              )
              .then(res1 => {
                this.$store.commit('delWorking')
                this.$store.commit('addWorking')
                this.corpus
                  .populateArtefactsOfImageReference(
                    this.corpus.combinations.get(this.scrollVersionID).imageReferences,
                    this.scrollVersionID
                  )
                  .then(res2 => {
                    this.$store.commit('delWorking')
                  })
              })
          })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.combination-canvas {
  max-height: initial;
}
</style>
