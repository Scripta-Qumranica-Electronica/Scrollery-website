<template>
  <div id="site" class="row">
    <main-menu id="main-menu" class="col-2"></main-menu>
    <div id="editing-window" class="col-10">
      <split-pane :min-percent='20' :default-percent='30' split="horizontal">
        <template slot="paneL">
          <split-pane split="vertical">
            <template slot="paneL">
              <single-image class="pane-content"></single-image>
            </template>
            <template slot="paneR">
              <div class="pane-content">Text Editor</div>
            </template>
          </split-pane>
        </template>
        <template slot="paneR">
          <combination></combination>
        </template>
      </split-pane>
    </div>
  </div>
</template>

<style lang="sass" scoped>
  #site {
    width: 100vw;
    height: calc(100vh - 50px);
    min-height: calc(100vh - 50px);
  }

#main-menu {
  // width: 300px;
  // height: calc(100vh - 50px);
  background: #1c86f2;
  color: white;
  // -webkit-transform: translate3d(0, 0, 0);
  //         transform: translate3d(0, 0, 0);
	// -webkit-backface-visibility: hidden;
  // backface-visibility: hidden;
  // float: left;
}

  #editing-window {
    // width: calc(100vw - 300px);
    // height: calc(100vh - 50px);
    // float: right;
  }
</style>


<script>

import { mapGetters } from 'vuex'
import MainMenu from './MainMenu.vue'
import splitPane from 'vue-splitpane'
import SingleImage from './SingleImage.vue'
import Combination from './Combination.vue'

export default {
  components: {
    'main-menu': MainMenu,
    'split-pane': splitPane,
    'single-image': SingleImage,
    'combination': Combination,
  },
  computed: {
    ...mapGetters([
      'userID', 'sessionID', 'username'
    ])
  },
  methods: {
  },
  mounted() {
  }
}

</script>