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
  },
  methods: {

    /* We will implement this fetchChildren() a bit later 
    once the server side scripts are taken care of. */
    // fetchChildren() {

    //   // we'll lazy load children, but cache them
    //   if (this.lastFetch !== this.requestType[this.menuType]) {
    //     this.$post('resources/cgi-bin/scrollery-cgi.pl', {
    //     transaction: this.requestType[this.menuType],
    //     combID: this.scrollDataID,
    //     user: this.userID,
    //     version_id: this.versionID,
    //   })
    //   .then(res => {
    //     if (res.status === 200 && res.data) {
    //       this.children = res.data.results
    //       this.lastFetch = this.requestType[this.menuType]
    //     }
    //   })
    //   .catch(console.error)
    //   }
    // },

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