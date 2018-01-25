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
      filename: 'https://www.qumranica.org/cgi-bin/iipsrv.fcgi?IIIF=P998-Fg005-R-C01-R01-D14112013-T105221-LR445__ColorCalData_IAA_Left_CC110304_110702.tif/info.json',
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