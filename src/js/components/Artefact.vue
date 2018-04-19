<template>
    <g :transform="'matrix(' + svg_matrix.join(', ') + ')'">
        <defs>
            <path :d="svg_shape" :id="'path-' + artefact.side + '-' + artefact.artefact_position_id" />
            <clipPath :id="'clip-' + artefact.side + '-' + artefact.artefact_position_id">
                <use 
                    stroke="none" 
                    fill="black" 
                    fill-rule="evenodd" 
                    xmlns:xlink="http://www.w3.org/1999/xlink" 
                    :xlink:href="'#path-' + artefact.side  + '-' + artefact.artefact_position_id" />
            </clipPath>
        </defs>
        <image
            v-if="images && images[0] && corpus.images.get(images[0])"
            :clip-path="'url(#clip-' + artefact.side + '-' + artefact.artefact_position_id + ')'"
            :xlink:href="corpus.images.get(images[0]) | address"
            :width="svg_rect.width ? svg_rect.width : 0"
            :height="svg_rect.height ? svg_rect.height : 0"
            :data-index="index"/>
    </g>
</template>

<script>
import { wktPolygonToSvg, wktParseRect, dbMatrixToSVG } from '~/utils/VectorFactory.js'

export default {
    props: {
        artefact: {},
        baseDPI: {
            type: Number,
            default: 1215,
        },
        index: Number,
        images: [],
        corpus: {},
    },
  computed: {
      scale() {
          return this.baseDPI / this.artefact.dpi
      },
      svg_rect() {
          return wktParseRect(this.artefact.rect)
      },
      svg_shape() {
          return wktPolygonToSvg(this.artefact.mask, this.svg_rect)
      },
      svg_matrix() {
          return dbMatrixToSVG(JSON.parse(this.artefact.transform_matrix).matrix)
      },
      imageReferences() {
          return this.corpus.imageReferences.get(this.artefact.image_catalog_id).images
      }
  },
  mounted() {
    console.log(this.artefact.toJS())
    console.log(this.corpus.artefacts._items.toJS())
    console.log(this.corpus.images._items.toJS())
    console.log(this.corpus.imageReferences._items.toJS())
  },
  filters: {
      address(element) {
        return element.url + element.filename
                + '/' + this.artefact.rect.x + ',' + this.artefact.rect.y
                + ',' + this.artefact.rect.width + ',' + this.artefact.rect.height 
                + '/pct:10/0/' + element.suffix
      }
  }
}
</script>