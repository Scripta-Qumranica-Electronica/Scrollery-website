<template>
  <div>
    <div :style="{background: $route.params.scrollVersionID === combination.scroll_version_id ? 'lightblue' : '#dedede'}">
      <span v-show="!nameInput" class="clickable-menu-item" @click="selectCombination">{{combination.name}}{{combination.user_id !== 1 ? ` - ${username}` : ' - default'}}</span>
      <el-input 
        class="artefact-name-change"
        v-show="nameInput" 
        placeholder="Label" 
        v-model="nameInput"
        size="mini"
        @blur="setName"
        @keyup.enter.native="setName"></el-input>
      <i v-if="!combination.locked" class="fa fa-edit" @click="startNameChange"></i>
      <i 
        class="fa" 
        :class="{'fa-lock': combination.locked, 'fa-unlock': !combination.locked}" 
        :style="{color: combination.locked ? 'red' : 'green'}"
        @click="lockScroll"></i>
      <i class="fa fa-clone" @click="cloneCombination"></i>
      <i v-if="!combination.locked" class="fa fa-trash-o" @click="corpus.combinations.removeItem(combination.scroll_version_id)"></i>
    </div>
    <!-- Use v-if here so we don't waste space on the DOM -->
    <div class="children" v-if="open">
      <li v-if="combination.locked === 0" @click="addNew('artefacts')"><i class="fa fa-plus-square"></i><span> {{ $i18n.str('New.Artefact') }}</span></li>
      <!-- <li v-if="combination.locked === 0" @click="addNew('combinations')"><i class="fa fa-plus-square"></i><span> {{ $i18n.str('New.Column') }}</span></li> -->
      <div @click="toggleColumns">
        <i class="fa" :class="{'fa-caret-right': !showColumns, 'fa-caret-down': showColumns}"></i>
        <span>columns</span>
        <i 
          v-if="loadingColumns" 
          class="fa fa-spinner fa-spin fa-fw" 
          aria-hidden="true"
          style="color: black"></i>
      </div>
      <div v-show="showColumns">
        <div
          class="submenu-items"
          v-for="col_id in combination.cols" 
          :key="'menu' + combination.scroll_version_id + '-' + col_id">
          <column-menu-item 
            :scroll-i-d="combination.scroll_id"
            :scroll-version-i-d="combination.scroll_version_id"
            :column="corpus.cols.get(col_id, combination.scroll_version_id)"
            :corpus="corpus">
          </column-menu-item>
        </div>
      </div>
      <div @click="toggleImages">
        <i class="fa" :class="{'fa-caret-right': !showImages, 'fa-caret-down': showImages}"></i>
        <span>images</span>
        <i 
          v-if="loadingImages" 
          class="fa fa-spinner fa-spin fa-fw" 
          aria-hidden="true"
          style="color: black"></i>
      </div>
      <div v-show="showImages">
        <div
          class="submenu-items"
          v-for="image_catalog_id in combination.imageReferences" 
          :key="'menu' + combination.scroll_version_id + '-' + image_catalog_id">
          <image-menu-item 
            :scroll-i-d="combination.scroll_id"
            :scroll-version-i-d="combination.scroll_version_id"
            :image="corpus.imageReferences.get(image_catalog_id)"
            :corpus="corpus">
          </image-menu-item>
        </div>
      </div>
    </div>

    <el-dialog
      :title="addTitle"
      :visible.sync="dialogVisible"
      width="80vw"
      height="60vh"
      >
      <add-new-dialog
        :add-type="addType"
        :corpus="corpus"
        :currentScrollVersionID="combination.scroll_version_id">
      </add-new-dialog>
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
      addTitle: '',
      addType: '',
      dialogVisible: false,
      nameInput: undefined,
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
          .then(res => {
            /* istanbul ignore next */
            this.loadingColumns = false
          })
          .catch(err => {
            /* istanbul ignore next */
            this.loadingColumns = false
            /* istanbul ignore next */
            console.error(err)
          })
        this.loadingImages = true
        this.corpus.imageReferences
          .populate({
            scroll_version_id: this.combination.scroll_version_id,
            scroll_id: this.combination.scroll_id,
          })
          .then(res => {
            /* istanbul ignore next */
            this.loadingImages = false
          })
          .catch(err => {
            /* istanbul ignore next */
            this.loadingImages = false
            /* istanbul ignore next */
            console.error(err)
          })
      }
    },

    startNameChange() {
      this.nameInput = this.combination.name
    },

    setName() {
      if (this.nameInput) {
        this.$store.commit('addWorking')
        this.corpus.combinations
          .updateName(this.combination.scroll_version_id, this.nameInput)
          .then(res => {
            /* istanbul ignore next */
            this.$store.commit('delWorking')
            /* istanbul ignore next */
            this.nameInput = undefined
          })
          .catch(err => {
            /* istanbul ignore next */
            this.$store.commit('delWorking')
            /* istanbul ignore next */
            console.error(err)
          })
      }
    },

    cloneCombination() {
      this.$store.commit('addWorking')
      this.corpus.combinations
        .cloneScroll(this.combination.scroll_version_id)
        .then(res => {
          /* istanbul ignore next */
          this.$store.commit('delWorking')
          this.$store.commit(
            'setLockedScrolls',
            Object.assign({}, this.$store.getters.lockedScrolls, {
              [res.data.scroll_data.scroll_version_id]: Boolean(res.data.scroll_data.locked),
            })
          )
        })
        .catch(err => {
          /* istanbul ignore next */
          this.$store.commit('delWorking')
          /* istanbul ignore next */
          console.error(err)
        })
    },

    toggleColumns() {
      this.showColumns = !this.showColumns
    },

    toggleImages() {
      this.showImages = !this.showImages
    },

    lockScroll() {},

    /* istanbul ignore next */
    addNew(type) {
      this.addType = type
      this.addTitle = `Add new ${type} to combination: ${this.combination.name} (v. ${
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
.submenu-items {
  margin-left: 20px;
}
</style>
