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
      <header-menu :corpus="menuCorpus"></header-menu>
      
      <!-- We currently use two nested "split-panes" to hold the individual components.
      Perhaps update to some more advanced system to manage organization
      and display of these components -->
      <div class="editing-pane-container">
        <split-pane :min-percent="20" :default-percent="30" split="horizontal">
          <template slot="paneL">
            <split-pane split="vertical">
              <template slot="paneL">
                <single-image 
                  class="pane-content single-image-pane"
                  :corpus="menuCorpus"></single-image>
              </template>
              <template slot="paneR">
                <editor class="pane-content"></editor>
              </template>
            </split-pane>
          </template>
          <template slot="paneR">
            <combination 
              class="combination-pane"
              :corpus="menuCorpus"></combination>
          </template>
        </split-pane>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderMenu from './HeaderMenu.vue'
import MainMenu from './menu/MainMenu.vue'
import SplitPane from 'vue-splitpane'
import SingleImage from './SingleImage.vue'
import Editor from './editor/Editor.vue'
import Combination from './Combination.vue'

import MenuCorpus from '~/models/MenuCorpus.js'
import Corpus from '~/models/Corpus.js'

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
      menuCorpus: MenuCorpus,
      corpus: Corpus,
    }
  },
  computed: {
    menuOpen() {
      return this.mouseOver || this.keepMenuOpen
    },
  },
  created() {
    this.corpus = new Corpus(this.$store.state.sessionID, this.$store.state.userID)
    this.corpus.populateCombinations()
    .then(res => {
      console.log(this.corpus.combinations.get(808))
      this.corpus.populateImageReferencesOfCombination(808)
      .then(res1 => {
        console.log(this.corpus.imageReferences.get(34774))
        console.log(this.corpus.images.get(7373))
      })
    })

    // Create and populate the menu corpus model.
    this.menuCorpus = new MenuCorpus(this.$store.state.sessionID, this.$store.state.userID, this.$set)
    this.$store.commit('addWorking')
    this.menuCorpus.populateCombinations()
    .then(res1 => {
      this.$store.commit('delWorking')
      // Check if routing info exists and populate corpus model based on that
      if(this.$route.params.scrollVersionID !== '~') {
        if (this.$route.params.scrollID !== '~') {
          this.menuCorpus.populateColumnsOfScrollVersion(this.$route.params.scrollVersionID, this.$route.params.scrollID)
          this.$store.commit('addWorking')
          this.menuCorpus.populateImagesOfScrollVersion(this.$route.params.scrollVersionID, this.$route.params.scrollID)
          .then(res2 => {
            this.$store.commit('delWorking')
            if(this.$route.params.imageID !== '~') {
              this.$store.commit('addWorking')
              this.menuCorpus.populateArtefactsofImage(this.$route.params.scrollVersionID, this.$route.params.imageID)
              .then(res3 => {
                this.$store.commit('delWorking')
                this.resetRouter()
              })
            } else {
              this.resetRouter()
            }
          })
        }
      }
    })
  },
  methods: {
    resetRouter() {
      // Trigger a router change here, so we don't need extra mount()
      // functions in all of our vue components.
      const scrollID = this.$route.params.scrollID
      const scrollVersionID = this.$route.params.scrollVersionID
      const colID = this.$route.params.colID
      const imageID = this.$route.params.imageID
      const artID = this.$route.params.artID

      this.$router.push({name: 'workbenchAddress',
        params: {
          scrollID: '~',
          scrollVersionID: '~',
          colID: '~',
          imageID: '~',
          artID: '~'
        }
      }, () => {
        // I don't know why the listeners don't pick up on the 
        // router change unless I give a tiny delay.
        setTimeout(() => {
          // Load back the initial values
          this.$router.push({
            name: 'workbenchAddress',
            params: {
              scrollID: scrollID,
              scrollVersionID: scrollVersionID,
              colID: colID,
              imageID: imageID,
              artID: artID
            }
          })
        },5)
      })
    }
  }
}
</script>

<style lang="scss" scoped>

@import "~sass-vars";

#site {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  font-size: 0;
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
}

#editing-window,
#side-menu, {
  position: absolute;
  height: 100%;
  vertical-align: top;
  font-size: 20px;
}

#show-hide-menu {
  display: none;
}

#side-menu {
  width: #{$sidebarWidth};
  left: #{$collapsedSidebarOffset};
  top: 0;
  overflow-x: hidden;
  transition: left #{$menuSlideTransitionOut};
  transition-timing-function: ease-out;

  &.open {
    left: 0;
  transition: left #{$menuSlideTransitionIn};
  transition-timing-function: ease-in;
  }
}
#editing-window {
  width: #{$editorWidthWithoutSidebar};
  left: #{$header};
  top: 0;
  transition: all #{$menuSlideTransitionOut};
  transition-timing-function: ease-out;

  &.open {
    left: #{$sidebarWidth};
    width: #{$editorWidthWithSidebar};
    transition: all #{$menuSlideTransitionIn};
    transition-timing-function: ease-in;
  }
}

.editing-pane-container {
  height: calc(100% - #{$header});
}

.pane-content {
  height: 100%;
}

.single-image-pane {
  background: lightgreen;
}

.combination-pane {
  background: cornflowerblue;
}

.vue-splitter-container {
  width: 100%;
}

.splitter-pane-resizer {
  background: black;
}
</style>