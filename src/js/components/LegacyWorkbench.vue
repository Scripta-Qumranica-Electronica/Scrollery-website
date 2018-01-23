<template>
  <div id="site">
    <main-menu></main-menu>

    <!-- editing panes -->
    <div id="editing-panes" class='top-level'>

      <!-- single-image-container -->
      <div id="single-image-container" class="main-container"></div>

      <!-- signs-container -->
      <div id="signs-container" class="main-container">
        <div id="signs-pane" class="main-pane">
          <div id="singleSignContainer" class="hidden fillingMostHeight contentField">
            <div id="signContext" dir="rtl"></div>
            <div id="signReadings" class="scrollable">
              <span id="addReadingPseudoButton" class="someSpaceToTheLeft pointerMouse">+</span>
            </div>
            <button id="finishSingleSignChangesButton" class="someSpaceAbove">Done</button>    
          </div>

          <div id="RichTextPanel" class="frame">
            <div id="richTextContainer" class="contentField" dir="rtl">
              <span id="fragmentName" class="fragmentName"></span>
            </div>
          </div>
          
          <div id="hidePanel" class="hidden">
            <div id="richTextButtons" class="someSpaceAbove richTextButtons" dir="rtl">
              <button id="richTextLineManager">Manage lines</button>
            </div>
        
            <div id="addReadingDiv">
              <input id="addReadingInput" maxlength="1" size="1" />
              <button id="confirmAddReadingButton">Ok</button>
              <button id="cancelAddReadingButton">Cancel</button>
            </div>
            <button id="confirmSingleSignChangesButton" class="someSpaceAbove">Ok</button>  
            <button id="cancelSingleSignChangesButton" class="someSpaceAbove">Cancel</button>
          </div>
        </div>

        <!-- horizontal divider -->
        <div id="horizontal-divider" class="pane-size"></div>

        <!-- pane menu -->
        <div class="pane-menu">
          <img src="resources/images/Fullscreen.png" alt="Full Screen" height="15">
        </div>

      <!-- /signs-container -->
      </div>
        
      <!-- combination container -->
      <div id="combination-container" class="main-container">
        <div id="combination-pane" class="main-pane"></div>
        <div id="vertical-divider" class="pane-size"></div>
        <div class="pane-menu"><img src="resources/images/Fullscreen.png" alt="Full Screen" height="15"></div>
      </div>
      <!-- /combination container -->

      <!-- main-osd -->
      <div id="main-osd">
        <button id="show-menu" class="hamburger hamburger--arrow toggle-nav" type="button">
          <span class="hamburger-box">
            <span class="hamburger-inner"></span>
          </span>
        </button>
      </div>
      <!-- /main-osd -->
    
    </div><!-- /editing panes -->  
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import MainMenu from './MainMenu.vue'

export default {
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (!vm.sessionID.length || vm.userID === -1) {
        vm.$router.push({path: '/'})
      }
    })
  },
  components: {
    'main-menu': MainMenu
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
    },
    loadLanguage() {
      return this.$i18n.load()
    }
  },
  mounted() {
    Promise.all([
      this.loadLegacyCode(),
      this.loadLanguage()
    ]).then(() => {
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