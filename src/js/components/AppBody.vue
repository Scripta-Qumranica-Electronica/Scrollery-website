<template>
  <div id="site">

    <!-- toggle for expanding/collapsing menu -->
    <input type="checkbox" id="show-hide-menu" class="hidden" v-model="menuOpen" />

    <!-- main menu in sidebar -->
    <main-menu
      :open="menuOpen"
      @mouseenter='menuOpen = true'
      @mouseleave='menuOpen = false'
    />

    <!-- editing panes -->
    <div id="editing-window">
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

  & ~ #side-menu {
    width: 50px;
    overflow-x: hidden;
    transition: width 300ms;
  }
  & ~ #editing-window {
    width: calc(100% - 50px);
    transition: width 300ms;
  }

  &:checked {
    & ~ #side-menu {
      width: 200px;
    }

    & ~ #editing-window {
      width: calc(100% - 200px);
    }
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
import MainMenu from './MainMenu.vue'
import SplitPane from 'vue-splitpane'
import SingleImage from './SingleImage.vue'
import Editor from './Editor.vue'
import Combination from './Combination.vue'

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
      menuOpen: false
    }
  }
}
</script>