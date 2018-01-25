<template>
  <div class="col col-12">
    <header-menu></header-menu>
    <div class="row app">
        <component v-bind:is="view"></component>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

// components
import HeaderMenu from './HeaderMenu.vue'
import Loading from './Loading.vue'
import AppBody from './AppBody.vue'

export default {
  /**
   * Route Guard
   */
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (!vm.sessionID.length || vm.userID === -1) {
        vm.$router.push({path: '/'})
      }
    })
  },

  components: {
    'header-menu': HeaderMenu,
    'loading': Loading,
    'app-body': AppBody,
  },

  data() {
    return {
      view: 'loading'
    }
  },

  computed: {
    ...mapGetters([
      'userID', 'sessionID'
    ])
  },

  mounted() {

    // This provides us an async latch to do some async work on initialization.
    // To be utilized later
    setTimeout(() => {
      this.view = 'app-body'
    }, 700)
  }
}
</script>

<style scoped>
.app {
  height: calc(100% - 50px);
}
</style>