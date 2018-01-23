<template>
  <div class="col col-12">
    <header-menu></header-menu>
    <div class="row app">
        <component v-bind:is="view"></component>
        <single-image></single-image>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

// components
import HeaderMenu from './HeaderMenu.vue'
import Loading from './Loading.vue'
import LegacyWorkbench from './LegacyWorkbench.vue'
import SingleImage from './SingleImage.vue'

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
    'legacy-work-bench': LegacyWorkbench,
    'single-image': SingleImage
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
      this.view = 'legacy-work-bench'
    }, 700)
  }
}
</script>

<style scoped>
.app {
  height: calc(100% - 50px);
}
</style>