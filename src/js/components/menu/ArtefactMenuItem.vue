<template>
  <div>
    <span class="clickable-menu-item" @click="setRouter" :style="{background: $route.params.artID === artefact.artefact_id ? 'lightblue' : '#dedede'}">
      <span>Artefact: {{artefact.name}}</span>
      <i v-if="!corpus.combinations.get(scrollVersionID).locked" class="fa fa-trash-o" @click="corpus.artefacts.removeItem(artefact.artefact_id, scrollVersionID)"></i>
    </span>
  </div>
</template>

<script>
export default {
  props: {
    artefact: undefined,
    scrollID: undefined,
    scrollVersionID: undefined,
    imageID: undefined,
    corpus: undefined,
  },
  methods: {
    setRouter() {
      const params = this.$route.params
      if (
        params.scrollID !== this.scrollID ||
        params.scrollVersionID !== this.scrollVersionID ||
        params.imageID !== this.imageID ||
        params.artID !== this.artefact.artefact_id
      ) {
        this.$router.push({
          name: 'workbenchAddress',
          params: {
            scrollID: this.scrollID,
            scrollVersionID: this.scrollVersionID,
            colID: params.colID,
            imageID: this.imageID,
            artID: this.artefact.artefact_id,
          },
        })
      }
      // We should tell our corpus object to try fetching the artefact every
      // time it is clicked in the menu.  The object should eventually have a hash
      // associated with it, and should be prepared to recieve a message back
      // saying "nothing changed" and it can leave the artefact alone.
    },
  },
}
</script>
