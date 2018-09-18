<template>
  <el-row class="header" type="flex" justify="space-between">
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
                    : 'No scroll selected'}}</span>
      </div>
    </el-col>
    <el-col :span="12">
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
    }
  },

  computed: {
    ...mapGetters(['username', 'working']),
    transactions() {
      return this.corpus.transactions.requestList.slice(0, 100)
    },
  },
  methods: {
    ...mapMutations(['setSessionID', 'setUsername', 'setUserID']),
    onLogout() {
      this.$store.commit('logout')
      this.$router.push({ name: 'login' })
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
