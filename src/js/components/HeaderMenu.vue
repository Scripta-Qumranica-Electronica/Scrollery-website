<template>
  <el-row class="header" type="flex" justify="space-between" :dir="$i18n.str('Direction')">
    <el-col :span="8">
      <div>
          <span>SQE</span>
          <span>{{scrolleryVersion}}</span>
      </div>
    </el-col>
    <el-col :span="4">
      <div class="right">
          <span>{{corpus.combinations 
                    && corpus.combinations.get(scrollVersionID) 
                    ? corpus.combinations.get(scrollVersionID).name 
                    : $i18n.str('No Scroll Selected')}}</span>
      </div>
    </el-col>
    <el-col :span="4">
      <div class="right">
        <el-dropdown @command="languageChanged">
          <el-button type="primary">
            <span><i class="fa fa-language" aria-hidden="true"></i></span>
            {{language}}<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="en">English</el-dropdown-item>
            <el-dropdown-item command="de">Deutsche</el-dropdown-item>
            <el-dropdown-item command="hb">עברית</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
       
      </div>
    </el-col>

    <el-col :span="4">
      <div class="right">
        <el-popover
          placement="bottom"
          title="Transactions"
          width="400"
          trigger="hover">
            <div v-for="id in transactions" :class="{'loading':  !corpus.transactions.requests[id].finished, 'loaded': corpus.transactions.requests[id].finished}">
              <!--Let's make this prettier by using a custom Vue component here, maybe the user can even -->
              <!--interact with it.-->
              {{corpus.transactions.requests[id].transaction}} – {{corpus.transactions.requests[id].finished ? 'loaded' : 'loading...'}}
            </div>
          <i    slot="reference"
                class="fa fa-list" 
                :class="{ 'fa-spinner fa-spin fa-fw' : corpus.transactions.unfinished > 0}"
                aria-hidden="true"
                style="color: white"></i>
        </el-popover>
        <span> {{ $i18n.str('User.LoggedInMessage', {name: username}) }}</span>
        <el-button size="mini" @click="onLogout">{{ $i18n.str('Logout') }}</el-button>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import sqeManifest from '@/sqe-manifest.json'

export default {
  props: {
    corpus: Object,
  },

  data() {
    return {
      scrolleryVersion: sqeManifest.version,
      scrollVersionID: this.$route.params.scrollVersionID,
      language: window.localStorage.getItem('language') || 'en',
    }
  },

  computed: {
    ...mapGetters(['username', 'working']),
    transactions() {
      return this.corpus.transactions.requestList.slice(0, 100)
    },
  },
  methods: {
    ...mapMutations(['setSessionID', 'setUsername', 'setUserID', 'setLanguage']),
    onLogout() {
      this.$store.commit('logout')
      this.$router.push({ name: 'login' })
    },
    languageChanged(lan) {
      this.language = lan
      this.setLanguage(this.language)
    },
  },

  watch: {
    $route(to, from) {
      if (to.params.scrollVersionID !== from.params.scrollVersionID) {
        this.scrollVersionID = to.params.scrollVersionID
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~sass-vars';

.header {
  height: #{$header};
  padding: #{$spacer};
  overflow: hidden;
  background-color: #{$ltBlue};
  border-bottom: 1px solid rgba(#999, 0.2);
}

.right {
  text-align: right;
}

h3,
span {
  color: #fff;
  line-height: calc(#{$header} - #{$spacer * 2});
}

div.loading {
  color: blue;
}

div.loaded {
  color: green;
}
</style>
