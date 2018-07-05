<template>
  <div>
    <div class="clickable-menu-item" @click="selectImage" :style="{background: $route.params.imageID === image.image_catalog_id ? 'lightblue' : '#dedede'}">
      <i class="fa" :class="{'fa-caret-right': !open, 'fa-caret-down': open}"></i>
      <span>
        {{image.institution}}: {{image.lvl1}}, {{image.lvl2}} {{image.side === 0 ? 'recto' : 'verso'}}
      </span>
      <i class="fa" 
        :class="{
          'fa-check-circle-o': image.master_sqe_image_id !== undefined, 
          'fa-exclamation-circle': image.master_sqe_image_id === undefined
          }"></i>
      <i 
        v-if="loadingArtefacts" 
        class="fa fa-spinner fa-spin fa-fw" 
        aria-hidden="true"
        style="color: black"></i>
    </div>
    <div class="children" v-show="open">
        <ul>
          <li v-if="image.artefacts" v-for="artefact_id in image.artefacts" :key="'menu-' + scrollVersionID + '-' + artefact_id">
            <artefact-menu-item 
              :artefact="corpus.artefacts.get(artefact_id)" 
              :scroll-i-d="scrollID"
              :scroll-version-i-d="scrollVersionID"
              :image-i-d="image.image_catalog_id"
              :corpus="corpus">
            </artefact-menu-item>
          </li>
        </ul>
    </div>
  </div>
</template>

<script>
import ArtefactMenuItem from './ArtefactMenuItem.vue'
import AddNewDialog from '~/components/AddNewDialog/AddNewDialog.vue'

export default {
  props: {
    scrollID: Number,
    scrollVersionID: Number,
    image: {},
    corpus: {},
  },
  components: {
    'artefact-menu-item': ArtefactMenuItem,
    'add-new-dialog': AddNewDialog,
  },
  data() {
    return {
      open: false,
      loadingArtefacts: false,
    }
  },
  methods: {
    setRouter() {
      if (
        this.$route.params.scrollID !== this.scrollID ||
        this.$route.params.scrollVersionID !== this.scrollVersionID ||
        this.$route.params.imageID !== this.image.image_catalog_id
      ) {
        this.$router.push({
          name: 'workbenchAddress',
          params: {
            scrollID: this.scrollID,
            scrollVersionID: this.scrollVersionID,
            colID: this.$route.params.colID,
            imageID: this.image.image_catalog_id,
            artID: '~',
          },
        })
      }
    },

    selectImage() {
      this.open = !this.open
      if (this.open) {
        this.setRouter()
        this.loadingArtefacts = true
        this.corpus.artefacts
          .populate({
            image_catalog_id: this.image.image_catalog_id,
            scroll_version_id: this.scrollVersionID,
          })
          .then(res => {
            /* istanbul ignore next */
            this.loadingArtefacts = false
          })
          .catch(err => {
            /* istanbul ignore next */
            this.loadingArtefacts = false
            /* istanbul ignore next */
            console.error(err)
          })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.fa-check-circle-o {
  color: green;
}
.fa-exclamation-circle {
  color: red;
}
</style>
