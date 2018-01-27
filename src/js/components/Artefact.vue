<template>
    <g :transform="'translate(' + artefactData.pos.x 
        + ' ' + artefactData.pos.y + ')' 
        + ' scale(' + scale + ')'">
        <defs>
            <path :d="artefactData.poly" :id="'path' + artefactData.id" />
            <clipPath :id="'clip' + artefactData.id">
                <use stroke="none" fill="black" fill-rule="evenodd" xmlns:xlink="http://www.w3.org/1999/xlink" :xlink:href="'#path' + artefactData.id" />
            </clipPath>
        </defs>
        <image :clip-path="'url(#clip' + artefactData.id + ')'"
            :xlink:href="artefactData.url 
            + '' + artefactData.filename
            + '/' + artefactData.rect.x + ',' + artefactData.rect.y
            + ',' + artefactData.rect.width + ',' + artefactData.rect.height 
            + '/pct:10' + '' + '/0/' 
            + artefactData.suffix"
            :width="artefactData.rect.width"
            :height="artefactData.rect.height"
            :data-index="index"/>
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
        index: Number,
    },
  components: {
  },
  data() {
    return {
    }
  },
  computed: {
      scale() {
          return this.baseDPI / this.artefactData.dpi
      },
  },
  methods: {
  },
}
</script>

<style lang="sass" scoped>
</style>