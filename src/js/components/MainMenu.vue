<template>
  <section id="side-menu" :class='{"open": open, "keep-open": keepOpen}' @mouseenter="$emit('mouseenter')" @mouseleave="$emit('mouseleave')">
    
    <!-- menu header -->
    <div class="header">
      <label for="show-hide-menu" :title="menuBarsTooltip"><i class="fa fa-bars"></i></label>
    </div>

    <!-- menu body -->
    <div class="menu-body" :class='{"open": open}'>

      <sidebar-menu-item
        :open='open'
        :title='combinationsTitle'
      >
        <span slot="icon"><i class="fa fa-hashtag"></i></span>
        <div slot="body">
          <div>
            <!-- These two buttons switch the listing mode to display either QWB -->
            <!-- cataloguing according to the DJD text editions, or the institutional -->
            <!-- cataloguing of the images.  Is there better terminology than -->
            <!-- Text/Image that would make this referencing distinction more clear? -->
            <el-radio-group v-model="menuDisplay" size="mini">
              <el-radio-button label="image">{{$i18n.str('Image')}}</el-radio-button>
              <el-radio-button label="text">{{$i18n.str('Text')}}</el-radio-button>
            </el-radio-group>
          </div>
          <div>
            <el-input class="searchBox" autosize placeholder="Enter search string" v-model="queryString"></el-input>
          </div>
          <div>
            <ul class="combination-menu" placeholder="Search for scroll">
              <li v-for="combination in filterCombinations" :key="combination.scroll_id + '-' + combination.version_id">
                  <combinaton-menu-item
                  :count="combination.count"
                  :name="combination.name"
                  :scrollDataID="combination.scroll_data_id"
                  :scrollID="combination.scroll_id"
                  :version="combination.version"
                  :versionID="combination.version_id"
                  :user="combination.user_id >>> 0 /* We have to cast this to int. */"
                  :menu-type="menuDisplay"
                  :locked="combination.locked >>> 0 /* We have to cast this to int. */"
                  />
              </li>
            </ul>
          </div>
        </div>
      </sidebar-menu-item>
    </div>
  </section>
</template>

<style lang="scss" scoped>

@import "~sass-vars";

.header {
  height: #{$header};
  background: #{$dkBlue};
  
  label {
    float: left;
    padding: #{$spacer};

    i {
      line-height: calc(#{$header} - #{$spacer * 2});
      font-size: 2em;
      color: #fff;
      transition: color 300ms;

      &:hover {
        color: $tan;
      }
    }
  }
}

#side-menu.keep-open .header label i {
  color: $tan;
}

.menu-body {
  min-width: calc(100% - #{$spacer * 2});
  height: calc(100% - #{$header});
  background: rgba($gray, .2);
  text-align: right;
  overflow-x: hidden;
  font-size: 18px;
}

.combination-menu {
  margin: 0;
  padding: 0 10px;
  height: 70vh;
  min-height: 70vh;
  overflow: auto;
  text-align: left;
}

#side-menu,
.menu-body,
.combination-menu {
  &::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }
}

.combination-menu li {
  display: block;
}

.searchBox {
  width: 90%;
}
</style>

<script>
import { mapGetters } from 'vuex'
import CombinationMenuItem from './CombinationMenuItem.vue'
import SidebarMenuItem from './SidebarMenuItem.vue'

export default {
  components: {
    'combinaton-menu-item': CombinationMenuItem,
    'sidebar-menu-item': SidebarMenuItem
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
    open: Boolean,
    keepOpen: Boolean
  },
  data() {
    return {
      combinationsTitle: "",
      combinations: [],
      menuBarsTooltip: "",
      queryString: '',
      menuDisplayInstitutional: true,
      menuDisplay: 'text',
    }
  },
  methods: {
    loadCombinations() {
      if (this.$store.getters.sessionID && this.$store.getters.userID > -1) {
        this.combinations = []
        this.$post('resources/cgi-bin/scrollery-cgi.pl', {
          transaction: 'getCombs',
          user: this.$store.getters.userID,
        })
        .then(res => {
          if (res.status === 200 && res.data) {
            this.combinations = res.data.results
          }
        })
        .catch(console.log)
      }
    }
  },
  mounted() {
    // i18n
    this.combinationsTitle = this.$i18n.str("Combinations");
    this.menuBarsTooltip = this.$i18n.str("Menu.Bars.Tooltip")
    this.loadCombinations()
  }
}

</script>