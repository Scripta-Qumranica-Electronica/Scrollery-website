<template>
  <div class="clickable-menu-item">
    <span @click="selectImage">
      {{corpus.images.itemWithID(dataId).institution}}: {{corpus.images.itemWithID(dataId).lvl1}}, {{corpus.images.itemWithID(dataId).lvl2}} {{corpus.images.itemWithID(dataId).side === 0 ? 'recto' : 'verso'}}
    </span>
    <div class="children" v-show="open">
        <ul>
          <li @click="addArtefact"><i class="fa fa-plus-square"></i><span> {{ $i18n.str('New.Artefact') }}</span></li>
          <li v-if="corpus.images.itemWithID(dataId).artefacts" v-for="artefact in corpus.images.itemWithID(dataId).artefacts" :key="'image-artefact-' + artefact">
            <artefact-menu-item 
              :artefact="corpus.artefacts.itemWithID(artefact).id" 
              :name="corpus.artefacts.itemWithID(artefact).name">
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
        :initial-combination="versionID"
        :initial-image="dataId"
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
    dataId: Number,
    versionID: '',
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
          this.corpus.populateArtefactsofImage(this.versionID, this.dataId)
        }
      }
    },

    addArtefact() {
      this.dialogVisible = true
      //Add code to create new artefact with the CGI script
      // const name = (new Date).getTime()
      // this.children.unshift({
      //   name: name,
      //   artefact_id: undefined,
      // })
      // this.$router.push({
      //     name: 'workbenchAddress',
      //     params: {
      //         scrollID: this.$route.params.scrollID,
      //         scrollVersionID: this.$route.params.scrollVersionID,
      //         colID: this.$route.params.colID ? this.$route.params.colID : '~',
      //         imageID: this.$route.params.imageID ? this.$route.params.imageID : '~',
      //         artID: `name-${name}`,
      //     }
      // })
    }
  },
}
</script>