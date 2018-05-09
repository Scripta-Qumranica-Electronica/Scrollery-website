<template>
  <div class="clickable-menu-item">
    <span @click="selectImage">
      {{image.institution}}: {{image.lvl1}}, {{image.lvl2}} {{image.side === 0 ? 'recto' : 'verso'}}
    </span>
    <div class="children" v-show="open">
        <ul>
          <li @click="addArtefact"><i class="fa fa-plus-square"></i><span> {{ $i18n.str('New.Artefact') }}</span></li>
          <li v-if="image.artefacts" v-for="artefact in image.artefacts" :key="'image-artefact-' + artefact">
            <artefact-menu-item 
              :artefact-i-d="artefact" 
              :scroll-i-d="scrollID"
              :scroll-version-i-d="scrollVersionID"
              :image-i-d="imageID"
              :corpus="corpus">
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
        :initial-image="imageID"
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
    imageID: Number,
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
      children: [],
      open: false,
      dialogVisible: false,
    }
  },
  methods: {
    setRouter() {
      if (
        this.$route.params.scrollID !== this.scrollID ||
        this.$route.params.scrollVersionID !== this.versionID ||
        this.$route.params.imageID !== this.imageID
      ) {
        this.$router.push({
          name: 'workbenchAddress',
          params: {
            scrollID: this.scrollID,
            scrollVersionID: this.scrollVersionID,
            colID: params.colID,
            imageID: this.imageID,
            artID: '~',
          },
        })
      }
    },

    selectImage() {
      this.open = !this.open
      if (this.open) {
        this.setRouter()
        if (!this.children.length) {
          this.corpus.populateArtefactsOfImageReference(this.imageID, this.scrollVersionID)

          // this.corpus.populateArtefactsofImage(this.scrollVersionID, this.imageID)
          // this.corpus.images.get(this.imageID).populateItems(this.imageID)
        }
      }
    },

    addArtefact() {
      this.dialogVisible = true
    },
  },
}
</script>
