<template>
  <span class="clickable-menu-item" @click="setRouter">
    <span>{{column.name}} ({{column.col_id}})</span>
    <i v-if="!corpus.combinations.get(scrollVersionID).locked" class="fa fa-trash-o" @click="corpus.cols.removeItem(column.col_id, scrollVersionID)"></i>
  </span>
</template>

<script>
export default {
  props: {
    scrollVersionID: undefined,
    scrollID: undefined,
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
        params.scrollVersionID !== this.scrollVersionID ||
        params.colID !== this.column.col_id
      ) {
        this.$router.push({
          name: 'workbenchAddress',
          params: {
            scrollID: this.scrollID,
            scrollVersionID: this.scrollVersionID,
            colID: this.column.col_id,
            imageID: params.imageID,
            artID: params.artID,
          },
        })
      }
    },
  },
}
</script>
