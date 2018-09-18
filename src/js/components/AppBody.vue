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
      
      <!-- For the earliest alpha version, only two panels are needed.-->
      <div class="editing-pane-container">
        <split-pane split="vertical">
          <template slot="paneL">
            <single-image 
              class="pane-content single-image-pane"
              :corpus="corpus"></single-image>
          </template>
          <template slot="paneR">
            <editor class="pane-content" :corpus="corpus"></editor>
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

import Corpus from '~/models/Corpus.js'
import { mapMutations } from 'vuex'

export default {
  components: {
    'header-menu': HeaderMenu,
    'main-menu': MainMenu,
    'split-pane': SplitPane,
    'single-image': SingleImage,
    editor: Editor,
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
    // The imageProxy should perhaps be stored in and retrieved from the server.
    // This is a proxy server hosted in Göttingen, it sanitizes and caches all
    // image requests.  This allows us to always be working with SSL encrypted
    // resources, and to force the proper CORS.
    this.setImageProxy('https://www.qumranica.org/image-proxy?address=')

    // Create and populate the corpus model, with existing data
    // from the router.
    this.$store.commit('resetWorking')

    this.corpus = new Corpus(this.$store.state.userID, this.$store.state.sessionID)
    // Setup the sockets to gather any initial data
    this.corpus.socket.once('receiveCombs', msg => {
      // Check if there is already a scroll_version_id in the route.
      // If so, load up cols and imageRefs for it.
      if (this.$route.params.scrollVersionID && this.$route.params.scrollVersionID !== '~') {
        // Now listen for completed img requests
        this.corpus.socket.once('receiveImgOfComb', msg => {
          // Check for an image_catalog_id in the route.
          // If it is there, load up the artefacts.
          if (this.$route.params.imageID) {
            // Now listen for completed artefact requests
            this.corpus.socket.once('receiveArtOfImage', msg => {
              this.resetRouter()
            })

            // Request artefacts
            this.corpus.artefacts.requestPopulate({
              image_catalog_id: this.$route.params.imageID,
              scroll_version_id: this.$route.params.scrollVersionID,
            })
          } else {
            this.resetRouter()
          }
        })

        // Request the cols and the artefacts.
        this.corpus.cols.requestPopulate({
          scroll_version_id: this.$route.params.scrollVersionID,
          scroll_id: this.$route.params.scrollID,
        })
        this.corpus.imageReferences.requestPopulate({
          scroll_version_id: this.$route.params.scrollVersionID,
          scroll_id: this.$route.params.scrollID,
        })
      }
    })
    // Grab the initial combination list and everything
    // else will fall into place
    this.corpus.combinations.requestPopulate()

    this.$store.commit('addWorking')
    this.$post('resources/cgi-bin/scrollery-cgi.pl', {
      transaction: 'getListOfAttributes',
    })
      .then(({ data }) => {
        this.$store.commit('delWorking')

        const { results: attributes } = data
        if (attributes && attributes.length) {
          this.$store.commit('setSignAttributeList', attributes)
        }
      })
      .catch(err => {
        this.$store.commit('delWorking')
        console.error(err)
      })
  },
  methods: {
    ...mapMutations(['setImageProxy']),

    /**
     * This function triggers a router change, though it copies all
     * data from the old router to the new one.  This way we do not
     * need to write special mount() functions in our Vue components,
     * they will catch any necessary changes via watch() functions that
     * listen to router changes, so loading the website with a full
     * address in the router behaves the same way as navigating to
     * the router address while the webist is already running.
     */
    resetRouter() {
      // Save the initial router address.
      const scrollID = this.$route.params.scrollID
      const scrollVersionID = this.$route.params.scrollVersionID
      const colID = this.$route.params.colID
      const imageID = this.$route.params.imageID
      const artID = this.$route.params.artID

      // Navigate to an empty router address.
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
            // Navigate back to the initial values on the next tick.
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
  background: cornflowerblue;
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
