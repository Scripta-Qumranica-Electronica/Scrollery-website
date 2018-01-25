<template>
    <g :transform="'translate(' + location.x * scaleFactor 
        + ' ' + location.y * scaleFactor + ')' 
        + ' scale(' + scaleFactor + ')'
        + ' rotate(' + artefactData.rotation + ' ' + pathRect.width/2 + ' ' + pathRect.height/2 + ')'">
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
        scaleFactor: {
            type: Number,
            default: 1.0,
        },
    },
  components: {
  },
  data() {
    return {
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
  },
  methods: {
  },
  watch: {
  }
}
</script>

<style lang="sass" scoped>
</style>