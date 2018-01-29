<template>
  <div>
    <span>{{ $i18n.str("Combinations") }}</span><button id="new-combination" type="button">add new</button>
    <div>
      <el-input placeholder="Enter search string" v-model="queryString"></el-input>
    </div>
    <div>
      <ul class="combination-menu" placeholder="Search for scroll">
        <li v-for="combination in filterCombinations" :key="combination.version_id">
            <combinaton-menu-item
            @artifact-selected="onArtifactSelected"
            :count="combination.count"
            :name="combination.name"
            :scrollDataID="combination.scroll_data_id"
            :scrollID="combination.scroll_id"
            :version="combination.version"
            :versionID="combination.version_id"
            />
        </li>
      </ul>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import CombinationMenuItem from './CombinationMenuItem.vue'

export default {
  components: {
    'combinaton-menu-item': CombinationMenuItem
  },
  computed: {
    ...mapGetters(['userID', 'sessionID']),
    filterCombinations() {
        return this.queryString.length 
            ?   this.combinations.filter((combination) => {
                    return combination.name.toLowerCase().indexOf(this.queryString.toLowerCase()) != -1
                })
            : this.combinations
    }
  },
  data() {
    return {
      combinations: [],
      queryString: '',
      menuDisplayInstitutional: true,
    }
  },
  methods: {
    onArtifactSelected(args) {
    }
  },
  mounted() {
    if (this.$store.getters.sessionID && this.$store.getters.userID > -1) {
      this.$post('resources/cgi-bin/GetImageData.pl', {
        transaction: 'getCombs',
        user: this.$store.getters.userID,
        SESSION_ID: this.$store.getters.sessionID
      })
      .then(res => {
        if (res.status === 200 && res.data) {
          this.combinations = res.data.results
        }
      })
      .catch(console.log)
    }
  }
}

</script>

<style lang="scss" scoped>

.combination-menu {
  margin: 0;
  // padding: 0 10px;
  height: 70vh;
  min-height: 70vh;
  overflow: auto;
}

.combination-menu li {
  display: block;
}

</style>