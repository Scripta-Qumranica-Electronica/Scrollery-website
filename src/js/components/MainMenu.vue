<template>
  <section id="side-menu" @mouseenter="$emit('mouseenter')" @mouseleave="$emit('mouseleave')">
    
    <!-- menu header -->
    <div class="header">
      <label for="show-hide-menu"><i class="fa fa-bars"></i></label>
    </div>

    <!-- menu body -->
    <div class="menu-body" :class='{"open": open}'>
      <div>
        <span>{{ $i18n.str("Combinations") }}</span><button id="new-combination" type="button">add new</button>
        <div>
          <el-input placeholder="Enter search string" v-model="queryString"></el-input>
        </div>
        <div>
          <ul class="combination-menu" placeholder="Search for scroll">
            <li v-for="combination in filterCombinations" :key="combination.scroll_id + '-' + combination.version_id">
                <combinaton-menu-item
                @artifact-selected="onArtifactSelected"
                :count="combination.count"
                :name="combination.name"
                :scrollDataID="combination.scroll_data_id"
                :scrollID="combination.scroll_id"
                :version="combination.version"
                :versionID="combination.version_id"
                :user="combination.user_id"
                :locked="combination.locked"
                />
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>

@import "~sass-vars";

.header {
  height: #{$header};
  padding: #{$spacer};
  background: #{$dkBlue};
  
  label {
    float: right;

    i {
      line-height: calc(#{$header} - #{$spacer * 2});
      font-size: 2em;
      color: #fff;
    }
  }
}

.menu-body {
  min-width: calc(100% - #{$spacer * 2});
  height: calc(100% - #{$header});
  padding: #{$spacer};
  background: rgba($gray, .2);
  text-align: center;
  overflow-x: hidden;
}

.combination-menu {
  margin: 0;
  padding: 0 10px;
  height: 70vh;
  min-height: 70vh;
  overflow: auto;
}

#side-menu,
.menu-body,
.combination-menu {
  &::-webkit-scrollbar {
    width: 0px;
    background: transparent;
  }
}

.combination-menu li {
  display: block;
}

</style>

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
            ? this.combinations.filter((combination) => {
                return combination.name.toLowerCase().indexOf(this.queryString.toLowerCase()) !== -1
              })
            : this.combinations
    }
  },
  props: {
    open: Boolean
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