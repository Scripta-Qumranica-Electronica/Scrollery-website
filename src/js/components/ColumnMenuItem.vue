<template>
  <span class="clickable-menu-item" @click="setRouter">
    {{name}} ({{dataId}})
  </span>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  props: {
    dataId: Number,
    name: String,
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters(['username', 'sessionID', 'userID'])
  },
  methods: {
    fetchChildren() {

      // we'll lazy load children, but cache them
      if (this.lastFetch !== this.requestType[this.menuType]) {
        this.$post('resources/cgi-bin/GetImageData.pl', {
        transaction: this.requestType[this.menuType],
        combID: this.scrollDataID,
        user: this.userID,
        version_id: this.versionID,
        SESSION_ID: this.sessionID
      })
      .then(res => {
        if (res.status === 200 && res.data) {
          this.children = res.data.results
          this.lastFetch = this.requestType[this.menuType]
        }
      })
      .catch(console.error)
      }
    },

    setRouter() {
        this.$router.push({ name: 'workbenchAddress',
                          params: { scrollID: this.$route.params.scrollID,
                                    scrollVersionID: this.$route.params.scrollVersionID,
                                    colID: this.dataId,
                                    imageID: this.$route.params.imageID ? this.$route.params.imageID : '-1',
                                    artID: this.$route.params.artID ? this.$route.params.artID : '-1'}
      })
    },
  },
  watch: {
  }
}
</script>