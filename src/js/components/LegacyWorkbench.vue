<template>
  <div id="site">
    <main-menu></main-menu>
    <div class="editing-window">
      <split-pane v-on:resize="resize" :min-percent='20' :default-percent='30' split="horizontal">
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
          <div class="pane-content">Combination Pane</div>
        </template>
      </split-pane>
    </div>

    <!-- main-osd -->
    <div id="main-osd">
      <button id="show-menu" class="hamburger hamburger--arrow toggle-nav" type="button">
        <span class="hamburger-box">
          <span class="hamburger-inner"></span>
        </span>
      </button>
    </div>
    <!-- /main-osd --> 
  </div>
</template>

<style lang="sass" scoped>
  .editing-window {
    width: calc(100vw - 300px);
    height: calc(100vh - 50px);
    float: right;
  }
</style>


<script>

import { mapGetters } from 'vuex'
import MainMenu from './MainMenu.vue'
import splitPane from 'vue-splitpane'
import SingleImage from './SingleImage.vue'

export default {
  components: {
    'main-menu': MainMenu,
    'split-pane': splitPane,
    'single-image': SingleImage
  },
  computed: {
    ...mapGetters([
      'userID', 'sessionID', 'username'
    ])
  },
  methods: {
    loadLegacyCode() {
      return new Promise(resolve => {
        require([
          "legacy/messageSpider.js",
          "legacy/layout-control.js",
          "legacy/editor/fragmentText.js",
          "legacy/editor/signVisualisation.js",
          "legacy/editor/singleSignEditor.js",
          "legacy/editor/richTextEditor.js",
          "legacy/single-image-control.js",
          "legacy/combination-control.js",
        ], resolve)
      })
    }
  },
  mounted() {
    this.loadLegacyCode()
    .then(() => {
      Spider.session_id = this.sessionID;
      Spider.user_id = this.userID;
      Spider.user = this.username;
      $('#editing-panes').css('visibility', 'visible');
      new SingleImageController($("#single-image-container"), 1);
      new CombinationController($("#combination-container"), 1);
      toggleNav(); //Show side menu
      $('.pane-button').prop('checked', true); //Set each pane to visible
      togglePane(); //Refresh panes so they appear
      login();
      Spider.addRichTextEditor();
    })
  }
}

</script>