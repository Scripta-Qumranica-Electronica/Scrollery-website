<template>
  <div>
    <span class="clickable-menu-item" @click="selectCombination">{{combination.name}}{{combination.user_id !== 1 ? ` - ${username}` : ' - default'}}</span>
    <i 
      class="clickable fa" 
      :class="{'fa-lock': combination.locked, 'fa-unlock': !combination.locked}" 
      :style="{color: combination.locked ? 'red' : 'green'}"
      @click="lockScroll"
      title="lock scroll"
    ></i>
    <i class="clickable fa fa-clone" @click="corpus.cloneScroll(combination.scroll_version_id)" title="Clone scroll for editing"></i>
    <!-- Use v-if here so we don't waste space on the DOM -->
    <div class="children" v-if="open">
        <ul>
          <li><span>columns</span></li>
          <li
            v-for="column in combination.cols" 
            :key="'column-' + column">
            <column-menu-item 
              :column-i-d="column"
              :scroll-i-d="combination.scroll_id"
              :scroll-version-i-d="combination.scroll_version_id"
              :column="corpus.cols.get(column)"
              :corpus="corpus"
            />
          </li>
          <li><span>images</span></li>
          <li
            v-for="image in combination.imageReferences" 
            :key="'menu-image-' + image">
            <image-menu-item 
              :image-i-d="image"
              :scroll-i-d="combination.scroll_id"
              :scroll-version-i-d="combination.scroll_version_id"
              :image="corpus.imageReferences.get(image)"
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
        this.corpus.populateColumnsOfCombination(
          this.combination.scroll_id,
          this.combination.scroll_version_id
        )
        this.corpus
          .populateImageReferencesOfCombination(
            this.combination.scroll_id,
            this.combination.scroll_version_id
          )
          .then(res => {
            this.corpus.populateRoisOfCombination(
              this.combination.scroll_id,
              this.combination.scroll_version_id
            )
          })
      }
    },

    lockScroll() {},
  },
}
</script>

<style lang="scss" scoped>
.clickable-menu-item {
  cursor: pointer;
}
</style>
