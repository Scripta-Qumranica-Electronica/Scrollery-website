<template>
  <div id="site">

    <!-- toggle for expanding/collapsing menu -->
    <input type="checkbox" id="show-hide-menu" class="hidden" v-model="keepMenuOpen" />

    <!-- main menu in sidebar -->
    <main-menu
      :open="menuOpen"
      :keepOpen="keepMenuOpen"
      :corpus="corpus"
      @mouseenter='mouseOver = true'
      @mouseleave='mouseOver = false'
    />

    <!-- editing panes -->
    <div id="editing-window" :class='{"open": menuOpen}'>
      <header-menu :corpus="corpus"></header-menu>
      
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
                  :corpus="corpus"></single-image>
              </template>
              <template slot="paneR">
                <editor class="pane-content"></editor>
              </template>
            </split-pane>
          </template>
          <template slot="paneR">
            <combination 
              class="combination-pane"
              :corpus="corpus"></combination>
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

import Corpus from '~/models/Corpus.js'

export default {
  components: {
    'header-menu': HeaderMenu,
    'main-menu': MainMenu,
    'split-pane': SplitPane,
    'single-image': SingleImage,
    editor: Editor,
    combination: Combination,
  },
  data() {
    return {
      keepMenuOpen: false,
      mouseOver: false,
      corpus: Corpus,
      menuLoaded: false,
    }
  },
  computed: {
    menuOpen() {
      return this.mouseOver || this.keepMenuOpen
    },
  },
  created() {
    // Create and populate the corpus model, with existing data
    // from the router.
    this.$store.commit('resetWorking')
    this.$store.commit('addWorking')
    this.corpus = new Corpus(this.$store.state.userID, this.$store.state.sessionID)

    // TODO: find I way to mock the corpus model for unit tests
    /* istanbul ignore next */
    this.corpus.populateCombinations().then(res => {
      this.menuLoaded = true
      this.$store.commit('delWorking')
      if (this.$route.params.scrollID && this.$route.params.scrollID !== '~') {
        this.$store.commit('addWorking')
        this.corpus.populateColumnsOfCombination(
          this.$route.params.scrollID,
          this.$route.params.scrollVersionID
        )
        this.corpus
          .populateImageReferencesOfCombination(
            this.$route.params.scrollID,
            this.$route.params.scrollVersionID
          )
          .then(res1 => {
            this.$store.commit('delWorking')
            if (this.$route.params.imageID !== '~') {
              this.$store.commit('addWorking')
              this.corpus
                .populateImagesOfImageReference(
                  this.$route.params.imageID,
                  this.$route.params.scrollVersionID
                )
                .then(res2 => {
                  this.$store.commit('delWorking')
                  if (this.$route.params.artID !== '~') {
                    this.$store.commit('addWorking')
                    this.corpus
                      .populateArtefactsOfImageReference(
                        this.$route.params.imageID,
                        this.$route.params.scrollVersionID
                      )
                      .then(res3 => {
                        this.$store.commit('delWorking')
                        this.resetRouter()
                      })
                  } else {
                    this.resetRouter()
                  }
                })
            } else {
              this.resetRouter()
            }
          })
      }
    })
  },
  methods: {
    resetRouter() {
      // Trigger a router change here, so we don't need extra mount()
      // functions in all of our vue components.  Is there a more
      // elegant way to achieve this?
      const scrollID = this.$route.params.scrollID
      const scrollVersionID = this.$route.params.scrollVersionID
      const colID = this.$route.params.colID
      const imageID = this.$route.params.imageID
      const artID = this.$route.params.artID

      this.$router.push(
        {
          name: 'workbenchAddress',
          params: {
            scrollID: '~',
            scrollVersionID: '~',
            colID: '~',
            imageID: '~',
            artID: '~',
          },
        },
        () => {
          this.$nextTick(() => {
            // Load back the initial values
            this.$router.push({
              name: 'workbenchAddress',
              params: {
                scrollID: scrollID,
                scrollVersionID: scrollVersionID,
                colID: colID,
                imageID: imageID,
                artID: artID,
              },
            })
          })
        }
      )
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~sass-vars';

#site {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  font-size: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei',
    '微软雅黑', Arial, sans-serif;
}

#editing-window,
#side-menu {
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
