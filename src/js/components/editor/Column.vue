<template>
  <div @mouseenter="active = true" @mouseleave="active = false"
  class="editor-column" v-if="corpus.cols.get(col_id, scroll_version_id) && corpus.cols.get(col_id, scroll_version_id).col_sign_id">
    <p>{{corpus.cols.get(col_id, scroll_version_id).name}}</p>
    <div v-for="line in lineList(corpus.cols.get(col_id, scroll_version_id).col_sign_id)"
    @click="currentLine = line">
      <span>{{corpus.lines.get(line, scroll_version_id).name}}</span>
      <span 
      v-for="sign in signList(corpus.lines.get(line, scroll_version_id).line_sign_id)"
      :class="`sign ${signClass(sign)} ${active && startSign === sign ? 'in-focus' : ''} ${corpus.combinations.get(scroll_version_id).locked === 0 ? 'unlocked' : ''}`"
      @mousedown="startSign = sign; signRange = undefined"
      @mouseup="range(sign)"
      >{{corpus.signChars.get(corpus.signs.get(sign).sign_char_ids[0], scroll_version_id).char}}</span>
    </div>
    
    <!--Note: I though something like this would walk the list in the template.-->
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
export default {
  components: {},
  data() {
    return {
      col_id: undefined,
      scroll_version_id: undefined,
      startSign: undefined,
      signRange: undefined,
      currentLine: undefined,
      active: false,
    }
  },
  props: {
    corpus: undefined,
  },
  computed: {
    signClass() {
      return sign => {
        let cssString = [].concat(
          ...this.corpus.signChars
            .get(this.corpus.signs.get(sign).sign_char_ids[0], this.scroll_version_id)
            .sign_char_attributes.map(
              a => this.corpus.signCharAttributes.get(a, this.scroll_version_id).attribute_values
            )
        )
        if (cssString.indexOf(20) === -1) cssString.push('IS_RECONSTRUCTED_FALSE')
        return cssString.join(' ')
      }
    },
  },
  created() {
    window.addEventListener('keydown', e => {
      if (
        this.active &&
        this.startSign &&
        this.corpus.combinations.get(this.scroll_version_id).locked === 0
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
      this.signRange = [this.startSign, sign]
      console.log(this.signRange)
    },
    lineList(sign) {
      let lines = []
      if (this.corpus.signs.get(sign) && this.corpus.signs.get(sign).line_id) {
        lines.push(this.corpus.signs.get(sign).line_id)
        while (
          (sign = this.corpus.signs.get(sign).next_sign_ids[0]) &&
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
          (sign = this.corpus.signs.get(sign).next_sign_ids[0]) &&
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

div.hide-reconstructed-text p span.\32 0 {
  opacity: 0;
}
</style>
