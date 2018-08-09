<template>
  <div>
    <img-with-progress v-if="fileName" :url="`${fileName}full/150,/0/default.jpg`"/>
    <!-- <img v-if="fileName" :src="`${fileName}full/150,/0/default.jpg`" /> -->
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
    <div v-if="loadingArtefacts">
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
      fileName: undefined,
      loadingArtefacts: false,
    }
  },
  mounted() {
    this.fetchArtefacts()
    this.fetchImages()
  },
  methods: {
    fetchImages() {
      this.fileName = undefined
      this.$store.commit('addWorking')
      this.corpus.images
        .populate({
          scroll_version_id: this.scrollVersionID,
          image_catalog_id: this.imageCatalogID,
        })
        .then(res => {
          this.$store.commit('delWorking')
          const filenames = this.corpus.imageReferences.get(this.imageCatalogID >>> 0).images

          for (let i = 0, key; (key = filenames[i]); i++) {
            if (this.corpus.images.get(key).is_master) {
              this.fileName = this.corpus.images.get(key).getAddress()
            }
          }
        })
        .catch(err => {
          this.$store.commit('delWorking')
          console.error(err)
        })
    },
    fetchArtefacts() {
      this.$store.commit('addWorking')
      this.loadingArtefacts = true
      this.corpus.artefacts
        .populate({
          image_catalog_id: this.imageCatalogID,
          scroll_version_id: this.scrollVersionID,
        })
        .then(res => {
          /* istanbul ignore next */
          this.$store.commit('delWorking')
          /* istanbul ignore next */
          this.loadingArtefacts = false
        })
        .catch(err => {
          /* istanbul ignore next */
          this.$store.commit('delWorking')
          /* istanbul ignore next */
          this.loadingArtefacts = false
          /* istanbul ignore next */
          console.error(err)
        })
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~sass-vars';
</style>
