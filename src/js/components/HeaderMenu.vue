<template>
  <el-row class="header" type="flex" justify="space-between">
    <el-col :span="4">
      <div>
          <span>SQE</span>
      </div>
    </el-col>
    <el-col :span="20">
      <div class="right">
        <span> {{ $i18n.str('User.LoggedInMessage', {name: username}) }}</span>
        <el-button @click="onLogout">{{ $i18n.str('Logout') }}</el-button>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
  computed: {
    ...mapGetters(['username']),
  },

  methods: {
    ...mapMutations(['setSessionID', 'setUsername', 'setUserID']),
    onLogout() {
      this.setSessionID('')
      this.setUserID('')
      this.setUsername('')
      this.$store.commit('logout')
      this.$router.push({ name: 'login' })
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
</style>
