<template>
  <div class="header row">
    <div class="col col-3">
        <h3>SQE</h3>
    </div>
    <div class="col col-9 right">
        <span> {{ $i18n.str('User.LoggedInMessage', {name: username}) }}</span>
        <button class="button outline" @click="onLogout">{{ $i18n.str('Logout') }}</button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
  computed: {
    ...mapGetters(['username'])
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

.button {
  min-height: calc(#{$header} - #{$spacer * 2});
  padding: 5px 10px;
  color: #fff;
  border: 2px solid #fff;
  border-radius: 2px;
  transition: all 300ms;
}

</style>