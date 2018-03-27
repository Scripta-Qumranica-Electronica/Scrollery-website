<template>
  <div class="clickable-menu-item">
    <span @click="selectImage">
      {{institution}}: {{plate}}, {{fragment}} {{side >>> 0 === 0 ? 'recto' : 'verso'}}
    </span>
    <div class="children" v-show="open">
        <ul>
          <li @click="addArtefact"><i class="fa fa-plus-square"></i><span> {{ $i18n.str('New.Artefact') }}</span></li>
          <li v-for="child in children" :key="child.artefact_id">
            <artefact-menu-item :artefact="child.artefact_id" :name="child.name"></artefact-menu-item>
          </li>
        </ul>
    </div>

    <el-dialog
      title="Add Artefact"
      :visible.sync="dialogVisible"
      width="80%">
      <add-new-dialog
        :add-type="'artefacts'"
        :initial-combination="versionID"
        :initial-image="dataId"></add-new-dialog>
      <!-- <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="dialogVisible = false">Confirm</el-button>
      </span> -->
    </el-dialog>
  </div>
</template>

<script>

import ArtefactMenuItem from './ArtefactMenuItem.vue'
import AddNewDialog from './AddNewDialog.vue'

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
    fetchChildren() {
      this.children = []
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
  watch: {
  }
}
</script>