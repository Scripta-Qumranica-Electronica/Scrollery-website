<template>
  <div id="site">
      <div id="main-menu" class='top-level'>
        <div class="accordion-panel open_first">
            <div id="login-title" class="accordion-title collapsible">Login</div>
            <div id="login-menu" class="accordion-content">
            </div>
        </div>
        <div class="accordion-panel">
            <div class="accordion-title">
              Combinations
              <button id="new-combination" type="button">add new</button>
            </div>
            <div id="combinations" class="accordion-content">
              <div id="user-combinations" class="main-menu-listing">
                <span>&emsp;-User combinations</span>
                <div id="user-combination-listings"></div>
              </div>
              <div id="default-combinations" class="main-menu-listing">
                <span>&emsp;-Default combinations</span>
                <div id="default-combination-listings"></div>
              </div>
            </div>
        </div>
        <div class="accordion-panel">
            <div class="accordion-title collapsible">Fragments and Artefacts</div>
            <div id="fragments" class="accordion-content">
              <div id="unused-fragments-listing" class="main-menu-listing"></div>
            </div>
        </div>
        <div class="accordion-panel">
            <div class="accordion-title collapsible">GUI</div>
            <div id="gui" class="accordion-content">
              <li><input type="checkbox" id="single-image-button" class="pane-button" reference="single-image-container">Single-Image</input></li>
              <li><input type="checkbox" id="signs-button" class="pane-button" reference="signs-container">Sign</input></li>
              <li><input type="checkbox" id="combination-button" class="pane-button" reference="combination-container">Combination</input></li>
            </div>
        </div>
      </div>

      <div id="editing-panes" class='top-level'>
        <div id="single-image-container" class="main-container"></div>

        <div id="signs-container" class="main-container">
          <div id="signs-pane" class="main-pane">
            <div id="singleSignContainer"
                class="hidden fillingMostHeight contentField">
              
				<div id="signContext"
					 dir="rtl"></div>
              
				<div id="signReadings"
					 class="scrollable">
					
					<span id="addReadingPseudoButton"
						  class="someSpaceToTheLeft pointerMouse">+</span>
					
				</div>
              
              <button id="finishSingleSignChangesButton"
                  class="someSpaceAbove">Done</button>
              
            </div>

            <div id="RichTextPanel"
				 class="frame">
              
				<div id="richTextContainer"
					 class="contentField"
					 dir="rtl">
				
					<span id="fragmentName"
						  class="fragmentName"></span>
				
				</div>
              
            </div>
            
			<div id="hidePanel"
				 class="hidden">
            
            	<div id="richTextButtons"
                	 class="someSpaceAbove richTextButtons"
                	 dir="rtl">
              
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
        <div id="horizontal-divider" class="pane-size"></div>
        <div class="pane-menu"><img src="resources/images/Fullscreen.png" alt="Full Screen" height="15"></div>
      </div>

      <div id="combination-container" class="main-container">
        <div id="combination-pane" class="main-pane"></div>
        <div id="vertical-divider" class="pane-size"></div>
        <div class="pane-menu"><img src="resources/images/Fullscreen.png" alt="Full Screen" height="15"></div>
      </div>

      <div id="main-osd">
        <button id="show-menu" class="hamburger hamburger--arrow toggle-nav" type="button">
          <span class="hamburger-box">
            <span class="hamburger-inner"></span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (!vm.sessionID.length || vm.userID === -1) {
        vm.$router.push({path: '/'})
      }
    })
  },
  computed: {
    ...mapGetters([
      'userID', 'sessionID', 'username'
    ])
  },
  mounted() {
    require([
      "./messageSpider.js",
      "./layout-control.js",
      "./editor/fragmentText.js",
      "./editor/signVisualisation.js",
      "./editor/singleSignEditor.js",
      "./editor/richTextEditor.js",
      "./single-image-control.js",
      "./combination-control.js",
      "./main-menu.js"
    ], () => {
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