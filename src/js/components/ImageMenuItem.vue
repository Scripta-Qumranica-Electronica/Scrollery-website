<template>
  <div>
    <span class="clickable-menu-item" @click="setRouter">
      {{institution}}: {{plate}}, {{fragment}} ({{dataId}})
    </span>
    <div class="children" v-show="open">
        <ul>
          <li v-for="child in children">
            <artefact-menu-item :data-id="child.artefact_id"></artefact-menu-item>
          </li>
        </ul>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import ArtefactMenuItem from './ArtefactMenuItem.vue'

export default {
  props: {
    dataId: Number,
    plate: '',
    fragment: '',
    institution: '',
    versionID: '',
  },
  components: {
    'artefact-menu-item': ArtefactMenuItem,
  },
  data() {
    return {
      children: [],
      open: false,
    }
  },
  computed: {
    ...mapGetters(['username', 'sessionID', 'userID'])
  },
  methods: {
    fetchChildren() {
      this.children = []
      // we'll lazy load children, but cache them
      this.$post('resources/cgi-bin/GetImageData.pl', {
        transaction: 'getArtOfImage',
        image_id: this.dataId,
        version_id: this.versionID,
        SESSION_ID: this.sessionID
      })
      .then(res => {
        if (res.status === 200 && res.data) {
          this.children = res.data.results
        }
      })
      .catch(console.error)
    },

    setRouter() {
      this.open = !this.open
      if (this.open) {
        this.$router.push({ name: 'workbenchAddress',
                          params: { scrollID: this.$route.params.scrollID,
                                    scrollVersionID: this.$route.params.scrollVersionID,
                                    colID: this.$route.params.colID ? this.$route.params.colID : '-1',
                                    imageID: this.dataId,
                                    artID: this.$route.params.artID ? this.$route.params.artID : '-1' }
        })
        if (!this.children.length) {
          this.fetchChildren()
        }
      }
    },
  },
  watch: {
  }
}
</script>