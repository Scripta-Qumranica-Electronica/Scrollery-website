<template>
<span class="sign" :class="signClasses" :data-sign-id="sign.id" :data-sign-index="index" :data-line-index="lineIndex">{{isWhitespace ? '  ' : sign.sign}}</span>
</template>

<script>

import { Store } from 'vuex'
import Sign from '~/models/Sign.js'
import attributes from './sign_attributes.js'

/**
 * A sign is the smallest unit known to the editor, and it can be comprised
 * of characters, whitespace, and possibly other relevant markings to be 
 * represented in the WYSIWYG editor.
 */
export default {
  props: {
    showReconstructedSigns: {
      type: Boolean,
      default: true
    },
    state: {
      type: Store,
      required: true
    },
    sign: {
      type: Sign,
      required: true
    },
    lineIndex: {
      type: Number,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  computed: {

    /**
     * Whether or not to show the current sign
     */
    isVisible() {
      return this.state.getters.showReconstructedText
                ? true // show reconstructed text ... i.e., we show everything
                : !this.sign.reconstructed(); // do not show reconstructed text, only show sign if it's no reconstructed
    },

    /**
     * Whether or not to show the current sign is a whitespace-type sign
     */
    isWhitespace() {
      return this.sign.isWhitespace();
    },

    /**
     * @return {object} a plain object with Vue-compatible classes and relevant conditions
     */
    signClasses() {
      const classes = {
        complete: !this.sign.is_reconstructed,
        visible: this.isVisible,
        focused: this.isInFocus,
        reconstructed: this.sign.is_reconstructed, 
        incomplete_clear: this.sign.readability === attributes.readability.incomplete.clear,
        incomplete_not_clear: this.sign.readability === attributes.readability.incomplete.unclear
      }

      // add font
      classes[this.state.getters.font.class] = true;

      return classes;
    }
  },
  methods: {
    onKeyup(e) {
      console.log(e)
    }
  }
}
</script>

<style lang="scss" scoped>
.sign {
  visibility: hidden;
  letter-spacing: .4px;
  white-space: nowrap;
  font-size: 22px;
}

.sign.visible {
  visibility: visible;
}

.sign.reconstructed {
  color: rgba(#aaa, 1);
}

.sign.incomplete_clear {
    color: yellow;
}
.sign.incomplete_not_clear {
    color: red;
}

.reconstruction-start {
  margin-left: -2px;
}
.reconstruction-end {
  margin-right: -2px;
}
</style>