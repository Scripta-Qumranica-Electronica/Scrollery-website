<template>
  <div>
    <div :style="{background: $route.params.scrollVersionID === combination.scroll_version_id ? 'lightblue' : '#dedede'}">
      <span class="clickable-menu-item" @click="selectCombination">{{combination.name}}{{combination.user_id !== 1 ? ` - ${username}` : ' - default'}}</span>
      <i 
        class="fa" 
        :class="{'fa-lock': combination.locked, 'fa-unlock': !combination.locked}" 
        :style="{color: combination.locked ? 'red' : 'green'}"
        @click="lockScroll"></i>
      <i class="fa fa-clone" @click="corpus.combinations.cloneScroll(combination.scroll_version_id)"></i>
      <i v-if="!combination.locked" class="fa fa-trash-o" @click="corpus.combinations.removeItem(combination.scroll_version_id)"></i>
    </div>
    <!-- Use v-if here so we don't waste space on the DOM -->
    <div class="children" v-if="open">
      <li v-if="combination.locked === 0" @click="addArtefact"><i class="fa fa-plus-square"></i><span> {{ $i18n.str('New.Artefact') }}</span></li>
      <div @click="toggleColumns">
        <i class="fa" :class="{'fa-caret-right': !showColumns, 'fa-caret-down': showColumns}"></i>
        <span>columns</span>
        <i 
          v-if="loadingColumns" 
          class="fa fa-spinner fa-spin fa-fw" 
          aria-hidden="true"
          style="color: black"></i>
      </div>
      <ul v-show="showColumns">
        <li
          v-for="col_id in combination.cols" 
          :key="'menu' + combination.scroll_version_id + '-' + col_id">
          <column-menu-item 
            :scroll-i-d="combination.scroll_id"
            :scroll-version-i-d="combination.scroll_version_id"
            :column="corpus.cols.get(col_id)"
            :corpus="corpus">
          </column-menu-item>
        </li>
      </ul>
      <div @click="toggleImages">
        <i class="fa" :class="{'fa-caret-right': !showImages, 'fa-caret-down': showImages}"></i>
        <span>images</span>
        <i 
          v-if="loadingImages" 
          class="fa fa-spinner fa-spin fa-fw" 
          aria-hidden="true"
          style="color: black"></i>
      </div>
      <ul v-show="showImages">
        <div
          v-for="image_catalog_id in combination.imageReferences" 
          :key="'menu' + combination.scroll_version_id + '-' + image_catalog_id">
          <image-menu-item 
            :scroll-i-d="combination.scroll_id"
            :scroll-version-i-d="combination.scroll_version_id"
            :image="corpus.imageReferences.get(image_catalog_id)"
            :corpus="corpus">
          </image-menu-item>
        </div>
      </ul>
    </div>

    <el-dialog
      :title="addType"
      :visible.sync="dialogVisible"
      width="80vw"
      height="60vh"
      >
      <add-new-dialog
        :add-type="'artefacts'"
        :corpus="corpus"></add-new-dialog>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Done</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ColumnMenuItem from './ColumnMenuItem.vue'
import ImageMenuItem from './ImageMenuItem.vue'
import AddNewDialog from '~/components/AddNewDialog/AddNewDialog.vue'

export default {
  props: {
    combination: {},
    corpus: {},
  },
  components: {
    'add-new-dialog': AddNewDialog,
    'column-menu-item': ColumnMenuItem,
    'image-menu-item': ImageMenuItem,
  },
  data() {
    return {
      open: false,
      loadingColumns: false,
      showColumns: false,
      loadingImages: false,
      showImages: false,
      addType: '',
      dialogVisible: false,
    }
  },
  computed: {
    ...mapGetters(['username']),
  },
  methods: {
    setRouter() {
      if (
        this.$route.params.scrollID !== this.combination.scroll_id ||
        this.$route.params.scrollVersionID !== this.combination.scroll_version_id
      ) {
        this.$router.push({
          name: 'workbenchAddress',
          params: {
            scrollID: this.combination.scroll_id,
            scrollVersionID: this.combination.scroll_version_id,
            imageID: '~',
            colID: '~',
            artID: '~',
          },
        })
      }
    },

    selectCombination() {
      this.open = !this.open
      if (this.open) {
        this.setRouter()
        this.loadingColumns = true
        this.corpus.cols
          .populate({
            scroll_version_id: this.combination.scroll_version_id,
            scroll_id: this.combination.scroll_id,
          })
          .then(res => (this.loadingColumns = false))
          .catch(err => {
            this.loadingColumns = false
            console.error(err)
          })
        this.loadingImages = true
        this.corpus.imageReferences
          .populate({
            scroll_version_id: this.combination.scroll_version_id,
            scroll_id: this.combination.scroll_id,
          })
          .then(res => (this.loadingImages = false))
          .catch(err => {
            this.loadingImages = false
            console.error(err)
          })
      }
    },

    toggleColumns() {
      this.showColumns = !this.showColumns
    },

    toggleImages() {
      this.showImages = !this.showImages
    },

    lockScroll() {},

    addArtefact() {
      this.addType = `Add new artefact to combination: ${this.combination.name} (v. ${
        this.combination.scroll_version_id
      })`
      this.dialogVisible = true
    },
  },
}
</script>

<style lang="scss" scoped>
.clickable-menu-item {
  cursor: pointer;
}
i {
  padding: 2px;
}
</style>
