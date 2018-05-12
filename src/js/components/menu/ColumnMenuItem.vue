<template>
  <span class="clickable-menu-item" @click="setRouter">
    {{column.name}} ({{columnID}})
  </span>
</template>

<script>
export default {
  props: {
    columnID: Number,
    scrollVersionID: Number,
    scrollID: Number,
    column: {},
    corpus: {},
  },
  methods: {
    /*
     * We still ned to implement a search to find all
     * artefacts belonging to a column.
     */
    setRouter() {
      const params = this.$route.params
      if (
        params.scrollID !== this.scrollID ||
        params.scrollVersionID !== this.versionID ||
        params.colID !== this.columnID
      ) {
        this.$router.push({
          name: 'workbenchAddress',
          params: {
            scrollID: this.scrollID,
            scrollVersionID: this.scrollVersionID,
            colID: this.columnID,
            imageID: params.imageID,
            artID: params.artID,
          },
        })
      }
    },
  },
}
</script>
