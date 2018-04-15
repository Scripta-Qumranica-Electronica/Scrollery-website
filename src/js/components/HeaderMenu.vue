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
          <span>{{corpus.corpus 
                    && corpus.corpus.get(scrollVersionID) 
                    ? corpus.corpus.get(scrollVersionID).name 
                    : 'No scroll selected'}}</span>
      </div>
    </el-col>
    <el-col :span="12">
      <div class="right">
        <i 
          v-show="working > 0" 
          class="fa fa-spinner fa-spin fa-fw" 
          aria-hidden="true"
          style="color: white"></i>
        <span> {{ $i18n.str('User.LoggedInMessage', {name: username}) }}</span>
        <el-button @click="onLogout">{{ $i18n.str('Logout') }}</el-button>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import sqeManifest from '../../../sqe-manifest.json'

export default {
  props: {
    corpus: Object,
  },

  data() {
    return {
      scrolleryVersion: sqeManifest.version,
      scrollVersionID: this.$route.params.scrollVersionID >>> 0,
    }
  },

  computed: {
    ...mapGetters(['username','working']),
  },

  methods: {
    ...mapMutations([
      'setSessionID',
      'setUsername',
      'setUserID',
    ]),
    onLogout() {
      this.setSessionID('')
      this.setUserID('')
      this.setUsername('')
      this.$store.commit('logout')
      this.$router.push({name: 'login'})
    }
  },

  watch: {
    '$route'(to, from) {
      if (to.params.scrollVersionID !== from.params.scrollVersionID)
      this.scrollVersionID = to.params.scrollVersionID >>> 0
    }
  }
}
</script>

<style lang="scss" scoped>

@import "~sass-vars";

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

h3, span {
  color: #fff;
  line-height: calc(#{$header} - #{$spacer * 2});
}

</style>