<template>
  <div>
    <span class="clickable-menu-item" @click="open = !open">{{ name }} - {{ username }} - v. {{ version }}</span>
    <div v-if="open">
      <el-radio-group v-model="menuType" size="mini">
        <el-radio-button label="art"></el-radio-button>
        <el-radio-button label="col"></el-radio-button>
        <el-radio-button label="img"></el-radio-button>
      </el-radio-group>
    </div>
    <div class="children" v-show="open">
        <ul>
          <li v-show="menuType === 'art'" v-for="child in children" :key="menuType + child.id">
            <art-menu-item :data-id="child.id"></art-menu-item>
          </li>
          <li v-show="menuType === 'col'" v-for="child in children" :key="menuType + child.id">
            <col-menu-item :data-id="child.id"
                            :name="child.name"></col-menu-item>
          </li>
          <li v-show="menuType === 'img'" v-for="child in children" :key="menuType + child.id">
            <img-menu-item :data-id="child.id"
                            :institution="child.institution"
                            :plate="child.lvl1"
                            :fragment="child.lvl2"></img-menu-item>
          </li>
        </ul>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import ArtMenuItem from './ArtMenuItem.vue'
import ColMenuItem from './ColMenuItem.vue'
import ImgMenuItem from './ImgMenuItem.vue'

export default {
  props: {
    count: 0,
    name: "",
    scrollDataID: 0,
    scrollID: 0,
    version: 0,
    versionID: 0
  },
  components: {
    'art-menu-item': ArtMenuItem,
    'col-menu-item': ColMenuItem,
    'img-menu-item': ImgMenuItem,
  },
  data() {
    return {
      children: [],
      menuType: 'art',
      open: false,
      requestType: {
        art: 'getArtOfComb',
        col: 'getColOfComb',
        img: 'getImgOfComb',
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
        this.$router.push({ name: 'workbenchScrollVersion',
                            params: { scrollID: this.scrollID, 
                                      scrollVersionID: this.versionID }
        })

        this.$post('resources/cgi-bin/GetImageData.pl', {
        transaction: this.requestType[this.menuType],
        combID: this.scrollDataID,
        user: this.userID,
        version_id: this.versionID,
        SESSION_ID: this.sessionID
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

    loadSelection(id) {
      this.$router.push({ name: 'workbenchScrollVersion',
                          params: { scrollID: this.scrollID,
                                    scrollVersionID: this.versionID, }
      })

      // this.$post('resources/cgi-bin/GetImageData.pl', {
      //   transaction: 'getFragsOfCol',
      //   colID: colID,
      //   user: this.$store.getters.userID,
      //   version: undefined,
      //   SESSION_ID: this.$store.getters.sessionID
      // })
      // .then(res => {
      //   if (res.data && res.data.results) {
      //     const col = res.data.results[0]

      //     // Emit event up with all relevant information
      //     this.$emit('artifact-selected', {
      //       version: this.version,
      //       versionID: this.versionID, // = current_version_id
      //       scrollDataID: this.scrollDataID,
      //       scrollID: this.scrollID,
      //       id: col["discrete_canonical_reference_id"]
      //     })
      //   }
      // })
      // .catch(res => {
      //   alert("Unable to load artefact.")
      //   console.error(res)
      // })
    }
  },
  watch: {
    open(newVal, prevVal){
      if (this.open) {
        this.fetchChildren();
      }
    },
    menuType(newVal, prevVal) {
      this.fetchChildren();
    },
  }
}
</script>

<style lang="scss" scoped>
  .clickable-menu-item {
    cursor: pointer;
  }
</style>
