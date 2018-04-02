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
          <li 
            v-if="menuType === 'text' && corpus.combinations.itemWithID(versionID).columns" 
            v-for="column in corpus.combinations.itemWithID(versionID).columns" 
            :key="'column-' + column">
            <column-menu-item 
              :data-id="corpus.columns.itemWithID(column).id"
              :name="corpus.columns.itemWithID(column).name"
              :corpus="corpus">
            </column-menu-item>
          </li>
          <li 
            v-if="menuType === 'image' && corpus.combinations.itemWithID(versionID).images" 
            v-for="image in corpus.combinations.itemWithID(versionID).images" 
            :key="'image-' + image">
            <image-menu-item 
              :data-id="corpus.images.itemWithID(image).id"
              :version-i-d="versionID"
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
    },

    selectCombination() {
      this.open = !this.open
      if (this.open) {
        this.setRouter()
        this.corpus.populateColumnsOfScrollVersion(this.scrollID, this.versionID)
        this.corpus.populateImagesOfScrollVersion(this.scrollID, this.versionID)
      }
    },

    cloneScroll() {
      this.$post('resources/cgi-bin/scrollery-cgi.pl', {
        transaction: 'copyCombination',
        scroll_id: this.scrollDataID,
        scroll_version_id: this.versionID,
      })
      .then(res => {
        if (res.status === 200 && res.data.scroll_clone === 'success') {
          // Please emit message to parent to either reload 
          // all combinations or add the one just created.
          // this.$emit('reloadListings', res.data)
        }
      })
      .catch(console.error)
    },

    lockScroll() {
      // this.$emit('reloadListings')
    }
  },
}
</script>

<style lang="scss" scoped>
  .clickable-menu-item {
    cursor: pointer;
  }
</style>
