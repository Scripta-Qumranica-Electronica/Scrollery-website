<template>
  <div>
    <span class="clickable-menu-item" @click="selectCombination">{{combination.name}}{{combination.user_id !== 1 ? ` - ${username}` : ' - default'}}</span>
    <i 
      class="fa" 
      :class="{'fa-lock': combination.locked, 'fa-unlock': !combination.locked}" 
      :style="{color: combination.locked ? 'red' : 'green'}"
      @click="lockScroll"></i>
    <i class="fa fa-clone" @click="corpus.combinations.cloneScroll(combination.scroll_version_id)"></i>
    <i v-if="!combination.locked" class="fa fa-trash-o" @click="corpus.combinations.removeItem(combination.scroll_version_id)"></i>
    <!-- Use v-if here so we don't waste space on the DOM -->
    <div class="children" v-if="open">
      <div @click="toggleColumns">
        <i class="fa" :class="{'fa-caret-right': !showColumns, 'fa-caret-down': showColumns}"></i>
        <span>columns</span>
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ColumnMenuItem from './ColumnMenuItem.vue'
import ImageMenuItem from './ImageMenuItem.vue'

export default {
  props: {
    combination: {},
    corpus: {},
  },
  components: {
    'column-menu-item': ColumnMenuItem,
    'image-menu-item': ImageMenuItem,
  },
  data() {
    return {
      open: false,
      showColumns: false,
      showImages: false,
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
        this.corpus.cols
          .populate({
            scroll_version_id: this.combination.scroll_version_id,
            scroll_id: this.combination.scroll_id,
          })
          .catch(res => console.log(res))
        this.corpus.imageReferences
          .populate({
            scroll_version_id: this.combination.scroll_version_id,
            scroll_id: this.combination.scroll_id,
          })
          .catch(res => console.log(res))
        // this.corpus.populateColumnsOfCombination(
        //   this.combination.scroll_id,
        //   this.combination.scroll_version_id
        // )
        // this.corpus
        //   .populateImageReferencesOfCombination(
        //     this.combination.scroll_id,
        //     this.combination.scroll_version_id
        //   )
        //   .then(res => {
        //     this.corpus.populateRoisOfCombination(
        //       this.combination.scroll_id,
        //       this.combination.scroll_version_id
        //     )
        //   })
      }
    },

    toggleColumns() {
      this.showColumns = !this.showColumns
    },

    toggleImages() {
      this.showImages = !this.showImages
    },

    lockScroll() {},
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
