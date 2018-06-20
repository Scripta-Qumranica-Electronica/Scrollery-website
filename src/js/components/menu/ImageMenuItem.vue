<template>
  <div class="clickable-menu-item">
    <div @click="selectImage">
      <i class="fa" :class="{'fa-caret-right': !open, 'fa-caret-down': open}"></i>
      <span>
        {{image.institution}}: {{image.lvl1}}, {{image.lvl2}} {{image.side === 0 ? 'recto' : 'verso'}}
      </span>
    </div>
    <div class="children" v-show="open">
        <ul>
          <li @click="addArtefact"><i class="fa fa-plus-square"></i><span> {{ $i18n.str('New.Artefact') }}</span></li>
          <li v-if="image.artefacts" v-for="artefact_id in image.artefacts" :key="'menu-' + scrollVersionID + '-' + artefact_id">
            <artefact-menu-item 
              :artefact="corpus.artefacts.get(artefact_id)" 
              :scroll-i-d="scrollID"
              :scroll-version-i-d="scrollVersionID"
              :image-i-d="image.image_catalog_id">
            </artefact-menu-item>
          </li>
        </ul>
    </div>

    <el-dialog
      title="Add Artefact"
      :visible.sync="dialogVisible"
      width="80vw"
      height="80vh"
      >
      <add-new-dialog
        :add-type="'artefacts'"
        :initial-combination="scrollVersionID"
        :initial-image="image.image_catalog_id"
        :corpus="corpus"></add-new-dialog>
      <!-- <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="dialogVisible = false">Confirm</el-button>
      </span> -->
    </el-dialog>
  </div>
</template>

<script>
import ArtefactMenuItem from './ArtefactMenuItem.vue'
import AddNewDialog from '~/components/AddNewDialog.vue'

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
      dialogVisible: false,
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
        this.corpus.artefacts
          .populate({
            image_catalog_id: this.image.image_catalog_id,
            scroll_version_id: this.scrollVersionID,
          })
          .then(res => {})
          .catch(err => {
            console.log(err)
          })
        // this.corpus
        //   .populateArtefactsOfImageReference(this.image.image_catalog_id, this.scrollVersionID)
        //   .then(res => {
        //     this.corpus.mapRoisAndArtefactsInCombination(this.scrollVersionID)
        //   })
      }
    },

    addArtefact() {
      this.dialogVisible = true
    },
  },
}
</script>
