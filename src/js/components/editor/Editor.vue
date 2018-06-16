<template>
    <div class="text-pane" :class='{fullscreen}'>
        <toolbar
          :state="state"
          ref="toolbar"
          @fullscreen="toggleFullScreen"
        />
        <composition
          :text="text"
          :state="state"
          :toolbar="$refs.toolbar"
          @refresh="refresh"
          :messageBar="$refs.messageBar"
        />
        <message-bar ref="messageBar"></message-bar>
    </div>
</template>

<script>
import KEY_CODES from './key_codes.js'
import CompositionModel from '~/models/Composition.js'
import Line from '~/models/Line.js'
import Column from '~/models/Column.js'
import Sign from '~/models/Sign.js'

// components
import MessageBar from './MessageBar.vue'
import Composition from './Composition.vue'
import Toolbar from './Toolbar.vue'

import editorStore from './EditorStore.js'

export default {
  components: {
    composition: Composition,
    toolbar: Toolbar,
    'message-bar': MessageBar,
  },
  computed: {
    colInRouter() {
      return this.$route.params.colID !== '~' && this.$route.params.colID > 0
    },
  },
  data() {
    return {
      /**
       * @type {boolean} true for fullscreen mode; false for in-line
       */
      fullscreen: false,

      /**
       * @type {Composition} A text model for display in the editor (can have multiple cols)
       */
      text: new CompositionModel(),

      /**
       * @type {Store} A Vuex store for the editor component tree
       */
      state: editorStore(this.$i18n),
    }
  },
  methods: {
    /**
     * Asynchronously retrieve the text from the server
     *
     * @param {string} scrollVersionID The scroll ID
     * @param {string} colID           The Column ID
     */
    getText(scrollVersionID, colID) {
      // todo: empty existing columns
      this.state.commit('setLocked', this.$store.getters.isScrollLocked(scrollVersionID))
      this.$refs.messageBar.close()

      this.$post('resources/cgi-bin/scrollery-cgi.pl', {
        transaction: 'getTextOfFragment',
        scroll_version_id: scrollVersionID,
        col_id: colID,
      })
        .then(res => {
          if (res.status === 200 && res.data) {
            // reset the composition
            this.text = new CompositionModel()
            const persisted = true

            const scroll = res.data.text[0]
            const column = scroll.fragments[0]

            // iterate through each line and add it to a lines array
            const lines = []
            for (let i = 0, line; (line = column.lines[i]); i++) {
              // iterate through each sign in the line and add it to the
              // the line model
              let signs = []
              for (let j = 0, rawSign; (rawSign = line.signs[j]); j++) {
                signs.push(new Sign(rawSign, persisted))
              }

              lines.push(
                new Line(
                  {
                    id: line.line_id,
                    name: line.line_name,
                  },
                  signs,
                  persisted
                )
              )
            }

            // finally insert new column into the text.
            this.text.insert(
              new Column(
                {
                  id: column.fragment_id,
                  name: column.fragment_name,
                },
                lines,
                persisted
              )
            )
          } else {
            throw new Error('Unable to retrieve text data')
          }

          // Show a message to the user if the user cannot edit:
          if (this.state.getters.locked) {
            this.$refs.messageBar.flash(
              'Clone this scroll from the menu in order to make changes in your own version.',
              {
                keepOpen: true,
              }
            )
          }
        })
        .catch(err => {
          // TODO: handle err
          console.error(err)
        })
    },

    /**
     * Refresh the editor from the server
     */
    refresh() {
      // reset the UI
      this.text = new CompositionModel()

      // get the new model from the server
      const colID = this.$route.params.colID
      if (colID !== '~' && colID > 0) {
        this.getText(this.$route.params.scrollVersionID, colID)
      }
    },

    /**
     * Show the editor in full screen mode
     */
    toggleFullScreen() {
      this.fullscreen = !this.fullscreen
    },
  },
  mounted() {
    // check to see if there's a columnID in the route
    // if so, attempt to load up the text straightaway
    this.refresh()
  },
  watch: {
    $route(to, from) {
      if (to.params.colID !== from.params.colID) {
        if (to.params.colID !== '~' && to.params.colID > 0) {
          this.getText(to.params.scrollVersionID, to.params.colID)
        } else {
          this.text = new CompositionModel()
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.text-pane {
  overflow: hidden;
  position: relative;
  background-color: #fff;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  transition: all 300ms;
}

.text-pane.fullscreen {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2000;
  background: #fff;
}
</style>
