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
        this.$router.push({ name: 'workbenchScrollVersion',
                            params: { scrollID: this.scrollID, 
                                      scrollVersionID: this.versionID }
        })

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
        this.$router.push({ name: 'workbenchScrollVersionTypeId',
                          params: { scrollID: this.$route.params.scrollID,
                                    scrollVersionID: this.$route.params.scrollVersionID,
                                    selectionType: 'col',
                                    id: this.dataId, }
      })
    },
  },
  watch: {
  }
}
</script>