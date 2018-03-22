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
          <li v-if="menuType === 'text'" v-for="child in children[menuType]">
            <column-menu-item 
              :data-id="child.id >>> 0"
              :name="child.name">
            </column-menu-item>
          </li>
          <li v-if="menuType === 'image'" v-for="child in children[menuType]">
            <image-menu-item 
              :data-id="child.id >>> 0"
              :institution="child.institution"
              :plate="child.lvl1"
              :fragment="child.lvl2"
              :version-i-d="versionID"
              :side="child.side">
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
    ...mapGetters(['username', 'sessionID', 'userID']),
  },
  methods: {
    fetchChildren() {
      // we'll lazy load children, but cache them
      if (this.children[this.menuType] && this.children[this.menuType].length < 1) {
        this.$post('resources/cgi-bin/scrollery-cgi.pl', {
        transaction: this.requestType[this.menuType],
        combID: this.scrollDataID,
        user: this.userID,
        version_id: this.versionID,
        })
        .then(res => {
          if (res.status === 200 && res.data) {
            this.children[this.menuType] = res.data.results
          }
        })
        .catch(console.error)
      }
    },

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
        this.fetchChildren()
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
          this.$emit('reloadListings', res.data)
        }
      })
      .catch(console.error)
    },
    lockScroll() {
      this.$emit('reloadListings')
    }
  },
  watch: {
    menuType() {
      if (this.open) {
        this.fetchChildren()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .clickable-menu-item {
    cursor: pointer;
  }
</style>
