<template>
    <g :transform="'matrix(' + artefactData.transformMatrix.join(', ') + ')'">
        <defs>
            <path :d="artefactData.poly" :id="'path' + artefactData.image + '-' + artefactData.artefact_id" />
            <clipPath :id="'clip-' + artefactData.image + '-' + artefactData.artefact_id">
                <use 
                    stroke="none" 
                    fill="black" 
                    fill-rule="evenodd" 
                    xmlns:xlink="http://www.w3.org/1999/xlink" 
                    :xlink:href="'#path' + artefactData.image + '-' + artefactData.artefact_id" />
            </clipPath>
        </defs>
        <image 
            :clip-path="'url(#clip-' + artefactData.image + '-' + artefactData.artefact_id + ')'"
            :xlink:href="url"
            :width="artefactData.rect.width ? artefactData.rect.width : 0"
            :height="artefactData.rect.height ? artefactData.rect.height : 0"
            :data-index="index"/>
    </g>
</template>

<script>
export default {
    props: {
        artefactData: {},
        baseDPI: {
            type: Number,
            default: 1215,
        },
        index: Number,
        corpus: {
            type: Object,
        },
    },
  components: {
  },
  computed: {
      scale() {
          return this.baseDPI / this.artefactData.dpi
      },
      url() {
        const images = this.corpus.images.itemWithID(this.artefactData.image)._itemList
        let image = {}
        images.forEach(item => {
            if (this.corpus.images.itemWithID(this.artefactData.image)._items[item].isMaster) {
                image = this.corpus.images.itemWithID(this.artefactData.image)._items[item]
            }
        })
        return  image.url + image.filename
                + '/' + this.artefactData.rect.x + ',' + this.artefactData.rect.y
                + ',' + this.artefactData.rect.width + ',' + this.artefactData.rect.height 
                + '/pct:10/0/' + image.suffix
      },
  },
}
</script>