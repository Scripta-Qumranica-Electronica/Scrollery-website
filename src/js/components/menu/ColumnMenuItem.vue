<template>
  <span class="clickable-menu-item" @click="setRouter">
    {{name}} ({{columnID}})
  </span>
</template>

<script>

export default {
  props: {
    columnID: Number,
    name: String,
    scrollVersionID: Number,
    scrollID: Number,
    corpus: {},
  },
  methods: {
    /*
     * We still ned to implement a search to find all
     * artefacts belonging to a column.
     */
    setRouter() {
      if (this.$route.params.scrollID !== this.scrollID 
        || this.$route.params.scrollVersionID !== this.versionID
        || this.$route.params.colID !== this.columnID) {
        this.$router.push({
          name: 'workbenchAddress',
          params: {
            scrollID: this.scrollID,
            scrollVersionID: this.scrollVersionID,
            colID: this.columnID,
            imageID: '~',
            artID: '~',
          }
        })
      }
    },
  },
  watch: {
  }
}
</script>