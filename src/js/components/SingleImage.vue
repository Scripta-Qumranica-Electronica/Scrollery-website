<template>
  <div></div>
</template>

<script>

export default {
  data() {
    return {
      imageElements: [],
      selectedImageUrls: []
    }
  },
  computed: {
  },
  methods: {
    
  },
  watch: {
    '$route' (to, from) {
      console.log(`From: ${from.params.colID}, to: ${to.params.colID}`)
    }
  }
}
</script>

<style lang="sass" scoped>

</style>