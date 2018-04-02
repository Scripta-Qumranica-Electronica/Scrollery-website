<template>
  <div id="site">

    <!-- toggle for expanding/collapsing menu -->
    <input type="checkbox" id="show-hide-menu" class="hidden" v-model="keepMenuOpen" />

    <!-- main menu in sidebar -->
    <main-menu
      :open="menuOpen"
      :keepOpen="keepMenuOpen"
      :corpus="menuCorpus"
      @mouseenter='mouseOver = true'
      @mouseleave='mouseOver = false'
    />

    <!-- editing panes -->
    <div id="editing-window" :class='{"open": menuOpen}'>
      <header-menu></header-menu>
      
      <!-- We currently use two nested "split-panes" to hold the individual components.
      Perhaps update to some more advanced system to manage organization
      and display of these components -->
      <split-pane :min-percent='20' :default-percent='30' split="horizontal">
        <template slot="paneL">
          <split-pane split="vertical">
            <template slot="paneL">
              <single-image class="pane-content"></single-image>
            </template>
            <template slot="paneR">
              <editor class="pane-content"></editor>
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

<style lang="scss" scoped>

@import "~sass-vars";

#site {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-size: 0;
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
}

#editing-window,
#side-menu, {
  position: relative;
  height: 100%;
  vertical-align: top;
  font-size: 20px;
  display: inline-block;
}

#show-hide-menu {
  display: none;
}

#side-menu {
  width: 50px;
  overflow-x: hidden;
  transition: width 300ms;

  &.open {
    width: #{$sidebarWidth};
  }
}
#editing-window {
  width: calc(100% - 50px);
  transition: width 300ms;

  &.open {
    width: calc(100% - #{$sidebarWidth});
  }
}

.pane-content {
  height: 100%;
}

.vue-splitter-container {
  width: 100%;
}
</style>


<script>
import HeaderMenu from './HeaderMenu.vue'
import MainMenu from './menu/MainMenu.vue'
import SplitPane from 'vue-splitpane'
import SingleImage from './SingleImage.vue'
import Editor from './editor/Editor.vue'
import Combination from './Combination.vue'

import MenuCorpus from '~/models/MenuCorpus.js'

export default {
  components: {
    'header-menu': HeaderMenu,
    'main-menu': MainMenu,
    'split-pane': SplitPane,
    'single-image': SingleImage,
    'editor': Editor,
    'combination': Combination,
  },
  data() {
    return {
      keepMenuOpen: false,
      mouseOver: false,
      menuCorpus: new MenuCorpus(this.$post, this.$store.state.userID, this.$set),
    }
  },
  computed: {
    menuOpen() {
      return this.mouseOver || this.keepMenuOpen
    },
  },
}
</script>