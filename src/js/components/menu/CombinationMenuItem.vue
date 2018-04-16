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
            v-if="corpus.combinations.get(scrollVersionID)"
            v-for="column in corpus.combinations.get(scrollVersionID).cols" 
            :key="'column-' + column">
            <column-menu-item 
              :column-i-d="corpus.cols.get(column).id"
              :name="corpus.cols.get(column).name"
              :scroll-i-d="scrollID"
              :scroll-version-i-d="scrollVersionID"
              :corpus="corpus">
            </column-menu-item>
          </li>
          <li><span>images</span></li>
          <li 
            v-if="corpus.combinations.get(scrollVersionID)"
            v-for="image in corpus.combinations.get(scrollVersionID).imageReferences" 
            :key="'menu-image-' + image">
            <image-menu-item 
              :image-i-d="image"
              :scroll-i-d="scrollID"
              :scroll-version-i-d="scrollVersionID"
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
    name: "",
    scrollDataID: 0,
    scrollID: 0,
    version: 0,
    scrollVersionID: 0,
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
            scrollVersionID: this.scrollVersionID,
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
        this.corpus.populateColumnsOfCombination(this.scrollID, this.scrollVersionID)
        this.corpus.populateImageReferencesOfCombination(this.scrollVersionID)
      }
    },
    // TODO implement the capability for these functions
    // in the data model.
    cloneScroll() {
      
    },

    lockScroll() {

    }
  },
}
</script>

<style lang="scss" scoped>
  .clickable-menu-item {
    cursor: pointer;
  }
</style>
