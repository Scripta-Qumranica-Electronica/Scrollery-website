<template>
  <span class="clickable-menu-item" @click="setRouter">Artefact: {{name}}</span>
</template>

<script>
export default {
  props: {
    artefactID: Number,
    scrollID: Number,
    scrollVersionID: Number,
    imageID: Number,
    name: '',
  },
  methods: {
    setRouter() {
      const params = this.$route.params
      if (
        params.scrollID !== this.scrollID ||
        params.scrollVersionID !== this.versionID ||
        params.imageID !== this.imageID ||
        params.artID !== this.artefactID
      ) {
        this.$router.push({
          name: 'workbenchAddress',
          params: {
            scrollID: this.scrollID,
            scrollVersionID: this.scrollVersionID,
            colID: '~',
            imageID: this.imageID,
            artID: this.artefactID,
          },
        })
      }
    },
  },
}
</script>
