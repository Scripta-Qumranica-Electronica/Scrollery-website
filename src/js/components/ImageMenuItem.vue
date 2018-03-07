<template>
  <div class="clickable-menu-item">
    <span @click="selectImage">
      {{institution}}: {{plate}}, {{fragment}} {{side === 0 ? 'recto' : 'verso'}}
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

import ArtefactMenuItem from './ArtefactMenuItem.vue'

export default {
  props: {
    dataId: Number,
    plate: '',
    fragment: '',
    institution: '',
    versionID: '',
    side: '',
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
  methods: {
    fetchChildren() {
      this.children = []
      // let children = []
      // we'll lazy load children, but cache them
      this.$post('resources/cgi-bin/scrollery-cgi.pl', {
        transaction: 'getArtOfImage',
        image_id: this.dataId,
        version_id: this.versionID,
      })
      .then(res => {
        if (res.status === 200 && res.data) {
          this.children = res.data.results
          // children = res.data.results
        }
      })
      .catch(console.error)
    },

    setRouter() {
      this.$router.push({ 
        name: 'workbenchAddress',
        params: {
          scrollID: this.$route.params.scrollID,
          scrollVersionID: this.$route.params.scrollVersionID,
          colID: this.$route.params.colID ? this.$route.params.colID : '~',
          imageID: this.dataId,
          artID: '~',
        }
      })
    },

    selectImage() {
      this.open = !this.open
      if (this.open) {
        this.setRouter()
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