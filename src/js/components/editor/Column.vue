<template>
  <div @mouseenter="active = true" 
  @mouseleave="active = false"
  class="editor-column" 
  :class="[
        state.getters.font ? state.getters.font.class : `text-sbl-hebrew`,
        state.getters.showReconstructedText ? '' : 'hide-reconstructed-text'
      ]"
  v-if="corpus.cols.get(col_id, scroll_version_id) && corpus.cols.get(col_id, scroll_version_id).col_sign_id">
    <p class="col">{{corpus.cols.get(col_id, scroll_version_id).name}}</p>
    <div v-for="line in lineList(corpus.cols.get(col_id, scroll_version_id).col_sign_id)"
    @click="currentLine = line">
      <span>{{corpus.lines.get(line, scroll_version_id).name}}</span>
      <span 
      v-for="sign in signList(corpus.lines.get(line, scroll_version_id).line_sign_id)"
      :class="`sign ${signClass(sign)} ${active && startSign === sign ? 'in-focus' : ''} ${corpus.combinations.get(scroll_version_id).locked === 0 ? 'unlocked' : ''}`"
      @mousedown="startSign = sign; signRange = undefined"
      @mouseup="(startSign !== sign) && range(sign)"
      >{{corpus.signChars.get(corpus.signs.getSignChar(sign), scroll_version_id).char}}</span>
    </div>
    
    <editing-dialog
      v-if="currentLine"
      :line="currentLine"
      :sign="startSign"
      :corpus="corpus"
      :scroll_version_id="~~scroll_version_id"
      :dialogVisible="is_locked && toolbarDialogVisible !== dialogVisible"
      @close="dialogVisible = !dialogVisible"
    />
    
    <!--Note: I thought something like this would walk the list in the template.-->
    <!--It does seem to walk the linked-list, but does not return the proper-->
    <!--sign_ids and it is really slow.-->
    <!--<div v-if="corpus.cols.get(col_id, scroll_version_id) && (sign_id = corpus.cols.get(col_id, scroll_version_id).col_sign_id)">-->
    <!--  <span v-for="sign_id in corpus.signs.get(sign_id).next_sign_ids[0]"-->
    <!--  @click="startSign = sign_id"-->
    <!--  >{{sign_id}}, </span>-->
    <!--</div>-->
  </div>
</template>

<script>
import EditingDialog from './dialog/EditingDialog.vue'

export default {
  components: {
    'editing-dialog': EditingDialog,
  },
  data() {
    return {
      col_id: undefined,
      scroll_version_id: undefined,
      startSign: undefined,
      signRange: undefined,
      currentLine: undefined,
      active: false,
      dialogVisible: false,
    }
  },
  props: {
    corpus: undefined,
    state: {
      required: true,
    },
    toolbarDialogVisible: undefined,
  },
  computed: {
    is_locked() {
      return this.corpus.combinations.get(this.$route.params.scrollVersionID) &&
        this.corpus.combinations.get(this.$route.params.scrollVersionID).locked
        ? false
        : true
    },
    signClass() {
      return sign => {
        let cssString = [].concat(
          ...this.corpus.signChars
            .get(this.corpus.signs.getSignChar(sign), this.scroll_version_id)
            .attribute_values.map(a => a.value)
        )
        if (cssString.indexOf(20) === -1) cssString.push('IS_RECONSTRUCTED_FALSE')
        return cssString.join(' ')
      }
    },
  },
  created() {
    window.addEventListener('keydown', e => {
      if (
        // Don't allow changes to locked scrolls.
        this.is_locked &&
        // Don't allow more changes when changes are being processed.
        this.corpus.transactions.unfinished === 0 &&
        // Don't allow changes when the editor dialog is open.
        this.toolbarDialogVisible === this.dialogVisible &&
        this.active &&
        this.startSign
      ) {
        if (e.key === 'ArrowLeft') {
          let { line_id, sign_id } = this.corpus.signs.nextSignLetter(
            this.startSign,
            this.scroll_version_id,
            this.col_id,
            this.currentLine
          )
          this.startSign = sign_id
          this.currentLine = line_id
        }

        if (e.key === 'ArrowRight') {
          let { line_id, sign_id } = this.corpus.signs.prevSignLetterInCol(
            this.startSign,
            this.scroll_version_id,
            this.col_id,
            this.currentLine
          )
          this.startSign = sign_id
          this.currentLine = line_id
        }

        if (e.key === 'ArrowDown') {
          let { line_id, sign_id } = this.corpus.signs.getSignInNextLine(
            this.startSign,
            this.scroll_version_id,
            this.col_id,
            this.currentLine
          )
          this.startSign = sign_id
          this.currentLine = line_id
        }

        if (e.key === 'ArrowUp') {
          let { line_id, sign_id } = this.corpus.signs.getSignInPrevLine(
            this.startSign,
            this.scroll_version_id,
            this.col_id,
            this.currentLine
          )
          this.startSign = sign_id
          this.currentLine = line_id
        }

        if (e.key === 'Meta') {
          // Do nothing or something wonderful!!!
        }

        if (e.key === 'Shift') {
          // Do nothing or something wonderful!!!
        }

        if (e.key === 'Backspace') {
          // Do nothing or something wonderful!!!
          const signToDelete = this.corpus.signs.prevSignInCol(
            this.startSign,
            this.scroll_version_id,
            this.col_id,
            this.currentLine
          )
          this.corpus.signs.deleteSign(
            signToDelete.sign_id,
            this.scroll_version_id,
            this.col_id,
            this.currentLine
          )
        } else {
          if (e.key.length === 1) {
            this.corpus.signs.addSignBefore(
              this.startSign,
              e.key,
              this.scroll_version_id,
              this.col_id,
              this.currentLine
            )
          }
        }
      }
    })
  },
  methods: {
    range(sign) {
      // here we will calculate all signs between two,
      // this can be used to select a bunch of signs and
      // delete them, or replace them.
      this.signRange = this.corpus.signs.getSignRange(this.startSign, sign)
      if (this.signRange) console.log(this.signRange)
    },

    lineList(sign) {
      let lines = []
      if (this.corpus.signs.get(sign) && this.corpus.signs.get(sign).line_id) {
        lines.push(this.corpus.signs.get(sign).line_id)
        while (
          (sign = this.corpus.signs.getNextSign(sign)) &&
          !this.corpus.signs.get(sign).col_id
        ) {
          if (this.corpus.signs.get(sign).line_id) lines.push(this.corpus.signs.get(sign).line_id)
        }
      }
      return lines
    },

    signList(sign) {
      let signs = []
      if (this.corpus.signs.get(sign)) {
        signs.push(sign)
        while (
          (sign = this.corpus.signs.getNextSign(sign)) &&
          !this.corpus.signs.get(sign).line_id
        ) {
          signs.push(sign)
        }
      }
      return signs
    },
  },
  watch: {
    $route(to, from) {
      if (
        to.params.colID !== from.params.colID ||
        to.params.scrollVersionID !== from.params.scrollVersionID
      ) {
        if (to.params.colID !== '~' && to.params.colID > 0) {
          this.col_id = to.params.colID
          this.scroll_version_id = to.params.scrollVersionID
          this.corpus.signs.requestPopulate({
            col_id: to.params.colID,
            scroll_version_id: to.params.scrollVersionID,
          })
        }
      }
    },
  },
}
</script>

<style lang="scss">
@import '~sass-vars';
div.editor-column {
  direction: rtl;
  overflow: auto;
  height: 100%;
}

span.sign {
  border-right: 2px solid transparent;
  margin-left: -2px;
  color: black;
}

span.sign.unlocked.in-focus {
  -webkit-animation: 1s blink step-end infinite;
  -moz-animation: 1s blink step-end infinite;
  -ms-animation: 1s blink step-end infinite;
  -o-animation: 1s blink step-end infinite;
  animation: 1s blink step-end infinite;
}

@keyframes "blink" {
  from,
  to {
    border-right: 2px solid black;
  }
  50% {
    border-right: 2px solid transparent;
  }
}

@-moz-keyframes blink {
  from,
  to {
    border-right: 2px solid black;
  }
  50% {
    border-right: 2px solid transparent;
  }
}

@-webkit-keyframes "blink" {
  from,
  to {
    border-right: 2px solid black;
  }
  50% {
    border-right: 2px solid transparent;
  }
}

@-ms-keyframes "blink" {
  from,
  to {
    border-right: 2px solid black;
  }
  50% {
    border-right: 2px solid transparent;
  }
}

@-o-keyframes "blink" {
  from,
  to {
    border-right: 2px solid black;
  }
  50% {
    border-right: 2px solid transparent;
  }
}

/* here are all the CSS directives for sign attributes */

/*Space character*/
span.\32:after {
  content: ' ';
}

/*span.\39:after {*/
/*  content: '|';*/
/*}*/

span.\32 0 {
  color: white;
  /* cursor does not show properly when using outline font */
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
  margin-right: 1px;
}

/*The following two css blocks add brackets*/
/*around reconstructed text.*/

/*.IS_RECONSTRUCTED_FALSE + .\32 0:before {*/
/*  content: '[';*/
/*  color: initial;*/
/*  text-shadow: initial;*/
/*  margin-right: initial;*/
/*}*/

/*span.\32 0 + .IS_RECONSTRUCTED_FALSE:before {*/
/*  content: ']';*/
/*}*/

span.\31 0 {
  margin-left: 1em;
}

span.\31 9 {
  color: blue;
}

span.\31 8 {
  color: red;
}

span.\33 4 {
  font-size: small;
  vertical-align: super;
}

span.\33 5 {
  font-size: small;
  vertical-align: sub;
}

div.hide-reconstructed-text span.\32 0 {
  opacity: 0;
}

p.col {
  text-align: center;
  font-weight: bold;
}
</style>
