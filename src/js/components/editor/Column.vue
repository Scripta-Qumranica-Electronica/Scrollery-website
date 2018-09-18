<template>
  <div class="editor-column">
    <!--<sign v-for="sign in columnSigns"-->
    <!--  :key="`edit-col-${sign}`"-->
    <!--  :sign_id="sign"-->
    <!--  :corpus="corpus"/>-->
    <span v-for="sign in corpus.cols.get(col_id, scroll_version_id) ? corpus.cols.get(col_id, scroll_version_id).signs : []" 
    :key="`edit-col-${sign}`">{{corpus.signChars.get(corpus.signs.get(sign).sign_chars[0], scroll_version_id).char}}</span>
  </div>
</template>

<script>
// models
import Sign from './Sign.vue'

export default {
  components: {
    sign: Sign,
  },
  data() {
    return {
      col_id: undefined,
      scroll_version_id: undefined,
      // columnSigns: [],
    }
  },
  props: {
    corpus: undefined,
  },
  computed: {},
  methods: {},
  watch: {
    $route(to, from) {
      if (
        to.params.colID !== from.params.colID ||
        to.params.scrollVersionID !== from.params.scrollVersionID
      ) {
        if (to.params.colID !== '~' && to.params.colID > 0) {
          this.col_id = to.params.colID
          this.scroll_version_id = to.params.scrollVersionID
          // this.columnSigns =
          //   this.corpus.cols.get(this.col_id, this.scroll_version_id) &&
          //   this.corpus.cols.get(this.col_id, this.scroll_version_id).signs
          this.corpus.signs
            .populate({
              col_id: to.params.colID,
              scroll_version_id: to.params.scrollVersionID,
            })
            .then(res => {
              console.log(this.col_id, this.scroll_version_id)
              this.columnSigns =
                this.corpus.cols.get(this.col_id, this.scroll_version_id) &&
                this.corpus.cols.get(this.col_id, this.scroll_version_id).signs
            })
            .catch(err => console.error(err))
        }
      }
    },
  },
}
</script>

<style lang="scss">
@import '~sass-vars';

/* here are all the CSS directives for sign attributes */
span.is_reconstructed_TRUE {
  color: grey;
  /* cursor does not show properly when using outline font */
  // text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
  // padding-left: 2px;
  // padding-right: 2px;
}

span.readability_INCOMPLETE_AND_NOT_CLEAR {
  color: blue;
}

span.readability_INCOMPLETE_AND_NOT_CLEAR:after {
  content: '֯';
  color: blue;
}

.readability_INCOMPLETE_BUT_CLEAR {
  color: red;
}

.readability_INCOMPLETE_BUT_CLEAR:after {
  content: 'ׄ';
  color: red;
}

span.relative_position_ABOVE_LINE {
  vertical-align: super;
}

span.relative_position_BELOW_LINE {
  vertical-align: sub;
}

div.hide-reconstructed-text p span.is_reconstructed_TRUE {
  opacity: 0;
}
.sign:hover {
  background: blue;
}
</style>
