<template>
  <div>
    <img-with-progress v-if="fileName" :url="`${fileName}full/150,/0/default.jpg`" type="img"/>
    <div v-if="corpus.imageReferences.get(imageCatalogID) && corpus.imageReferences.get(imageCatalogID).artefacts.length > 0">
      <div v-for="artefactID in corpus.imageReferences.get(imageCatalogID).artefacts" :key="artefactID">
          <span>{{`${corpus.artefacts.get(artefactID, scrollVersionID) && corpus.artefacts.get(artefactID, scrollVersionID).name 
              ? corpus.artefacts.get(artefactID, scrollVersionID).name 
              : 'Loading...'}`}}
          </span>
          <!-- TODO: Eventually delete the following when no longer useful for debugging.-->
          <span>(id: {{artefactID}})</span> 
      </div>
    </div>
  <div v-else>
    <div v-if="corpus.transactions.requests[artefactRequestID] && !corpus.transactions.requests[artefactRequestID].finished">
      <i 
          class="fa fa-spinner fa-spin fa-fw" 
          aria-hidden="true"
          style="color: black"></i>
      <span>Loading artefacts...</span>
    </div>
    <span v-else>No artefacts found for this image.</span>
  </div>
  </div>
</template>

<script>
import ImgWithProgress from '~/components/ImgWithProgress.vue'

export default {
  components: {
    'img-with-progress': ImgWithProgress,
  },
  props: {
    corpus: {},
    imageCatalogID: undefined,
    scrollVersionID: undefined,
  },
  data() {
    return {
      artefactRequestID: undefined,
    }
  },
  computed: {
    fileName() {
      let file = undefined
      const filenames = this.corpus.imageReferences.get(~~this.imageCatalogID)
        ? this.corpus.imageReferences.get(~~this.imageCatalogID).images
        : []
      for (let i = 0, key; (key = filenames[i]); i++) {
        if (this.corpus.images.get(key).is_master) {
          file = this.corpus.images.get(key).getAddress
        }
      }
      return file
    },
  },
  mounted() {
    this.fetchArtefacts()
    this.fetchImages()
  },
  methods: {
    fetchImages() {
      /* istanbul ignore next */
      this.corpus.images.requestPopulate({
        scroll_version_id: this.scrollVersionID,
        image_catalog_id: this.imageCatalogID,
      })
    },
    fetchArtefacts() {
      /* istanbul ignore next */
      this.artefactRequestID = this.corpus.artefacts.requestPopulate({
        image_catalog_id: this.imageCatalogID,
        scroll_version_id: this.scrollVersionID,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~sass-vars';
</style>
