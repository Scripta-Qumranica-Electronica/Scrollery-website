<template>
  <span class="clickable-menu-item" @click="setRouter">
    {{institution}}: {{plate}}, {{fragment}} ({{dataId}})
  </span>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  props: {
    dataId: Number,
    plate: '',
    fragment: '',
    institution: '',
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
        this.$router.push({ name: 'workbenchScrollVersionPlateFragment',
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
        this.$router.push({ name: 'workbenchScrollVersionPlateFragment',
                          params: { scrollID: this.$route.params.scrollID,
                                    scrollVersionID: this.$route.params.scrollVersionID,
                                    selectionType: 'img',
                                    plate: this.plate,
                                    fragment: this.fragment, }
      })
    },
  },
  watch: {
  }
}
</script>