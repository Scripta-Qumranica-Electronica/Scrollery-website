<template>
  <div style="{width: 100%; height: 100%;}">
    <div :id="navPanel" style="{width: 100%; height 50px;}"></div>
    <div style="{width: 100%; height: calc(100% - 50px);}">
      <open-seadragon 
        :tile-sources="filename"
        :ajax-with-credentials="false"
        :show-navigator="true"
        :home-fills-viewer="true"
        :pan-horizontal="false"
        :pan-vertical="false"
        :mouse-nav-enabled="false"
        :navigator-id="navPanel">
      </open-seadragon>
    </div>
  </div>
    
</template>

<script>
import OpenSeadragon from './OpenSeadragon.vue'
export default {
  components: {
    'open-seadragon': OpenSeadragon
  },
  data() {
    return {
      imageElements: [],
      selectedImageUrls: [],
      filename: '',
      navPanel: 'seadragonNavPanel'
    }
  },
  computed: {
  },
  methods: {
  },
  watch: {
    '$route' (to, from) {
      if (to.params.colID && to.params.colID !== from.params.colID) {
        this.$post('resources/cgi-bin/GetImageData.pl', {
        transaction: 'imagesOfFragment',
        idType: 'composition',
        id: to.params.colID,
        SESSION_ID: this.$store.getters.sessionID
      })
        .then(res => {
            if (res.status === 200 && res.data) {
                this.imageElements = res.data.results
                this.filename = `${res.data.results[0].url}${res.data.results[0].filename}/info.json`
            }
        })
      }
    }
  }
}
</script>

<style lang="sass" scoped>

</style>