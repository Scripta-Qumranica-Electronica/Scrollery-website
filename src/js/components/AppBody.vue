<template>
  <div id="site" class="row">
    <main-menu id="main-menu" class="col-2"></main-menu>
    <div id="editing-window" class="col-10">
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
#site {
  width: 100vw;
  height: calc(100vh - 50px);
  min-height: calc(100vh - 50px);
}

.pane-content {
  height: 100%;
}

#main-menu {
  background: #1c86f2;
  color: white;
}
</style>


<script>
import MainMenu from './MainMenu.vue'
import splitPane from 'vue-splitpane'
import SingleImage from './SingleImage.vue'
import Editor from './Editor.vue'
import Combination from './Combination.vue'

export default {
  components: {
    'main-menu': MainMenu,
    'split-pane': splitPane,
    'single-image': SingleImage,
    'editor': Editor,
    'combination': Combination,
  },
}
</script>