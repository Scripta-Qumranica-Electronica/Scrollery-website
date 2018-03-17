<template>
  <span class="clickable-menu-item" @click="setRouter">Artefact: {{dataId}}</span>
</template>

<script>

export default {
  props: {
    dataId: Number,
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
          artID: this.dataId
        }
      })
    },
  },
}
</script>

