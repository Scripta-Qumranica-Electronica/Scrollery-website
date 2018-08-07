<template>
  <div>
    <img v-if="fileName" :src="`${fileName}full/pct:3/0/default.jpg`" />
  </div>
</template>

<script>
export default {
  props: {
    corpus: {},
    imageCatalogID: undefined,
    scrollVersionID: undefined,
  },
  data() {
    return {
      fileName: undefined,
    }
  },
  mounted() {
    this.fetchImages(this.imageCatalogID)
  },
  // watch: {
  //   image_catalog_id(to, from) {
  //     if (to && to !== from) {
  //       this.fetchImages(to)
  //     }
  //   },
  // },
  methods: {
    fetchImages(id) {
      this.fileName = undefined
      this.$store.commit('addWorking')
      this.corpus.images
        .populate({
          scroll_version_id: this.scrollVersionID,
          image_catalog_id: id,
        })
        .then(res => {
          this.$store.commit('delWorking')
          const filenames = this.corpus.imageReferences.get(id >>> 0).images

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
  },
}
</script>

<style lang="scss" scoped>
@import '~sass-vars';
</style>
