<template>
    <g :transform="'translate(' + currentLocation.x 
        + ' ' + currentLocation.y + ')' 
        + ' scale(' + scale + ')'"
        ref="currentGroup"
        @mousedown="mousedown"
        @mousemove="mousemove"
        @mouseup="mouseup">
        <defs>
            <path :d="clipPath" :id="'path' + artefactData.id" />
            <clipPath :id="'clip' + artefactData.id">
                <use stroke="none" fill="black" fill-rule="evenodd" xmlns:xlink="http://www.w3.org/1999/xlink" :xlink:href="'#path' + artefactData.id" />
            </clipPath>
        </defs>
        <image :clip-path="'url(#clip' + artefactData.id + ')'"
            :xlink:href="artefactData.url 
            + '' + artefactData.filename
            + '/' + pathRect.x + ',' + pathRect.y
            + ',' + pathRect.width + ',' + pathRect.height 
            + '/pct:10' + '' + '/0/' 
            + artefactData.suffix"
            :width="pathRect.width"
            :height="pathRect.height"/>
        <use :xlink:href="'#path' + artefactData.id" stroke="blue" fill="none" />
    </g>
</template>

<script>
import {geoJsonPolygonToSvg, geoJsonPointToSvg, geoJsonParseRect} from '../utils/VectorFactory'
export default {
    props: {
        artefactData: {},
        baseDPI: {
            type: Number,
            default: 1215,
        },
    },
  components: {
  },
  data() {
    return {
        clickOrigin: undefined,
        currentLocation: undefined,
    }
  },
  computed: {
      pathRect() {
          return geoJsonParseRect(this.artefactData.rect)
      },
      clipPath() {
          return geoJsonPolygonToSvg(this.artefactData.poly, this.pathRect)
      },
      location() {
          return geoJsonPointToSvg(this.artefactData.pos)
      },
      scale() {
          return this.baseDPI / this.artefactData.dpi
      },
      parentSVG() {
          return this.$refs['currentGroup'].parentElement
      },
  },
  beforeMount() {
      this.currentLocation = this.location
  },
  methods: {
      mousedown(event) {
          this.clickOrigin = this.pointInSvg(event.clientX, event.clientY)
      },
      mousemove(event) {
          if (this.clickOrigin) {
              const currentLoc = this.pointInSvg(event.clientX, event.clientY)
              this.$refs['currentGroup'].setAttribute('transform', `translate(${this.location.x
              + currentLoc.x 
              - this.clickOrigin.x} ${this.location.y
              + currentLoc.y 
              - this.clickOrigin.y}) scale(${this.scale})`)
          }
      },
      mouseup(event) {
          if (this.clickOrigin) {
            const currentLoc = this.pointInSvg(event.clientX, event.clientY)
            this.currentLocation.x += currentLoc.x - this.clickOrigin.x
            this.currentLocation.y += currentLoc.y - this.clickOrigin.y
            this.clickOrigin = undefined
          }
      },
      pointInSvg(x, y) {
        const pt = this.parentSVG.createSVGPoint();
        pt.x = x;
        pt.y = y;
        return pt.matrixTransform(this.parentSVG.getScreenCTM().inverse());
    },
  },
  watch: {
  }
}
</script>

<style lang="sass" scoped>
</style>