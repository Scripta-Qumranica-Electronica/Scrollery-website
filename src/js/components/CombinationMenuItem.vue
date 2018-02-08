<template>
  <div>
    <span class="clickable-menu-item" @click="open = !open">{{name}}{{user ? ` - ${username} - v. ${version}` : ''}}</span>
    <i class="fa fa-clone" @click="cloneScroll"></i>
    <i v-show="locked" class="fa fa-lock" style="color: red"></i>
    <i v-show="!locked" class="fa fa-unlock" style="color: green"></i>
    <div class="children" v-show="open">
        <ul>
          <li v-if="menuType === 'text'" v-for="child in children">
            <column-menu-item :data-id="child.id"
                            :name="child.name"></column-menu-item>
          </li>
          <li v-if="menuType === 'image'" v-for="child in children">
            <image-menu-item :data-id="child.id"
                            :institution="child.institution"
                            :plate="child.lvl1"
                            :fragment="child.lvl2"
                            :version-i-d="versionID"></image-menu-item>
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
      children: [],
      open: false,
      requestType: {
        'text': 'getColOfComb',
        'image': 'getImgOfComb',
      },
      lastFetch: '',
    }
  },
  computed: {
    ...mapGetters(['username', 'sessionID', 'userID'])
  },
  methods: {
    fetchChildren() {
      // we'll lazy load children, but cache them
      if (this.lastFetch !== this.requestType[this.menuType]) {
        this.$post('resources/cgi-bin/GetImageData.pl', {
        transaction: this.requestType[this.menuType],
        combID: this.scrollDataID,
        user: this.userID,
        version_id: this.versionID,
        })
        .then(res => {
          if (res.status === 200 && res.data) {
            this.children = res.data.results
            this.lastFetch = this.requestType[this.menuType]
          }
        })
        .catch(console.error)
        }
    },
    cloneScroll(){
      this.$post('resources/cgi-bin/GetImageData.pl', {
        transaction: 'copyCombination',
        scroll_id: this.scrollDataID,
        scroll_version_id: this.versionID,
      })
      .then(res => {
        if (res.status === 200 && res.data.scroll_clone === 'success') {
          console.log('Cloned scroll')
        }
      })
      .catch(console.error)
    }
  },
  watch: {
    open(newVal, prevVal){
      if (this.open) {
        console.log(this.scrollID + ' ' + this.versionID)
        this.$router.push({
          name: 'workbenchAddress',
          params: {
            scrollID: this.scrollID, 
            scrollVersionID: this.versionID,
            imageID: -1,
            colID: -1,
            artID: -1
          }
        })
        this.fetchChildren();
      }
    },
    menuType(newVal, prevVal) {
      if (this.open && newVal !== prevVal) {
        this.fetchChildren();
      }
    },
  }
}
</script>

<style lang="scss" scoped>
  .clickable-menu-item {
    cursor: pointer;
  }
</style>
