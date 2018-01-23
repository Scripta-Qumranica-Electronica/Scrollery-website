<template>
  <div class="row">
    <div class="col col-3">
        <h3>SQE</h3>
    </div>
    <div class="col col-6"></div>
    <div class="col col-3">
      <button class="button secondary outline" @click="onLogout">{{ $i18n.str('Logout') }}</button>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    onLogout() {
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