<template>
  <span class="clickable-menu-item" @click="setRouter">Artefact: {{name}}</span>
</template>

<script>

export default {
  props: {
    artefact: undefined,
    name: "",
  },
  methods: {
    setRouter() {
      this.$router.push({
        name: 'workbenchAddress',
        params: {
          scrollID: this.$route.params.scrollID,
          scrollVersionID: this.$route.params.scrollVersionID,
          colID: this.$route.params.colID ? this.$route.params.colID : '~',
          imageID: this.$route.params.imageID ? this.$route.params.imageID : '~',
          artID: this.artefact
        }
      })
    },
  },
}
</script>

