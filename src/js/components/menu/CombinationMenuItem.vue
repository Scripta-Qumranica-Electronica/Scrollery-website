<template>
  <div>
    <span class="clickable-menu-item" @click="selectCombination">{{name}}{{user ? ` - ${username} - v. ${version}` : ''}}</span>
    <i class="fa fa-clone" @click="cloneScroll"></i>
    <i 
      class="fa" 
      :class="{'fa-lock': locked, 'fa-unlock': !locked}" 
      :style="{color: locked ? 'red' : 'green'}"
      @click="lockScroll"></i>
    <div class="children" v-show="open">
        <ul>
          <li><span>columns</span></li>
          <li 
            v-for="column in corpus.combinations.itemWithID(versionID).columns" 
            :key="'column-' + column">
            <column-menu-item 
              :column-i-d="corpus.columns.itemWithID(column).id"
              :name="corpus.columns.itemWithID(column).name"
              :scroll-i-d="scrollID"
              :scroll-version-i-d="versionID"
              :corpus="corpus">
            </column-menu-item>
          </li>
          <li><span>images</span></li>
          <li 
            v-for="image in corpus.combinations.itemWithID(versionID).images" 
            :key="'menu-image-' + image">
            <image-menu-item 
              :image-i-d="corpus.images.itemWithID(image).id"
              :scroll-i-d="scrollID"
              :scroll-version-i-d="versionID"
              :corpus="corpus">
            </image-menu-item>
          </li>
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
    count: 0,
    name: "",
    scrollDataID: 0,
    scrollID: 0,
    version: 0,
    versionID: 0,
    user: 0,
    menuType: '',
    locked: "",
    corpus: {},
  },
  components: {
    'column-menu-item': ColumnMenuItem,
    'image-menu-item': ImageMenuItem,
  },
  data() {
    return {
      children: {
        'text': [],
        'image': [],
      },
      open: false,
      requestType: {
        'text': 'getColOfComb',
        'image': 'getImgOfComb',
      },
      lastFetch: '',
    }
  },
  computed: {
    ...mapGetters(['username',]),
  },
  methods: {
    setRouter() {
      if (this.$route.params.scrollID !== this.scrollID 
        || this.$route.params.scrollVersionID !== this.versionID) {
        this.$router.push({
          name: 'workbenchAddress',
          params: {
            scrollID: this.scrollID, 
            scrollVersionID: this.versionID,
            imageID: '~',
            colID: '~',
            artID: '~'
          }
        })
      }
    },

    selectCombination() {
      this.open = !this.open
      if (this.open) {
        this.setRouter()
        this.corpus.populateColumnsOfScrollVersion(this.versionID, this.scrollID)
        this.corpus.populateImagesOfScrollVersion(this.versionID, this.scrollID)
      }
    },
    // TODO implement the capability for these functions
    // in the data model.
    // cloneScroll() {
      
    // },

    // lockScroll() {

    // }
  },
}
</script>

<style lang="scss" scoped>
  .clickable-menu-item {
    cursor: pointer;
  }
</style>
