<template>
  <span class="clickable-menu-item" @click="setRouter">
    {{name}} ({{dataId}})
  </span>
</template>

<script>

export default {
  props: {
    dataId: Number,
    name: String,
    corpus: {},
  },
  methods: {
    /*
     * We still ned to implement a search to find all
     * artefacts belonging to a column.
     */
    setRouter() {
      this.$router.push({
        name: 'workbenchAddress',
        params: {
          scrollID: this.$route.params.scrollID,
          scrollVersionID: this.$route.params.scrollVersionID,
          colID: this.dataId,
          imageID: this.$route.params.imageID ? this.$route.params.imageID : '~',
          artID: this.$route.params.artID ? this.$route.params.artID : '~'
        }
      })
    },
  },
  watch: {
  }
}
</script>