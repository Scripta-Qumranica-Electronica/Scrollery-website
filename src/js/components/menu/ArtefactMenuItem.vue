<template>
  <span class="clickable-menu-item" @click="setRouter">Artefact: {{corpus.artefacts.get(artefactID).name}}</span>
</template>

<script>
export default {
  props: {
    artefactID: {
      required: true,
      type: Number,
    },
    scrollID: {
      required: true,
      type: Number,
    },
    scrollVersionID: {
      required: true,
      type: Number,
    },
    imageID: {
      required: true,
      type: Number,
    },
    corpus: {
      required: true,
      type: Object,
    },
  },
  methods: {
    setRouter() {
      const params = this.$route.params
      if (
        params.scrollID !== this.scrollID ||
        params.scrollVersionID !== this.scrollVersionID ||
        params.imageID !== this.imageID ||
        params.artID !== this.artefactID
      ) {
        this.$router.push({
          name: 'workbenchAddress',
          params: {
            scrollID: this.scrollID,
            scrollVersionID: this.scrollVersionID,
            colID: params.colID,
            imageID: this.imageID,
            artID: this.artefactID,
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
