<template>
  <div class="row">
    <div class="col col-3">
        <h3>SQE</h3>
    </div>
    <div class="col col-6"></div>
    <div class="col col-3">
      <span> {{ $i18n.str('User.LoggedInMessage', {name: username}) }}</span>
      <button class="button secondary outline" @click="onLogout">{{ $i18n.str('Logout') }}</button>
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

<style lang="sass" scoped>

div {
  height: 50px;
  border-bottom: 1px solid rgba(#999, 0.2);
}

h3 {
  line-height: 50px;
}

</style>