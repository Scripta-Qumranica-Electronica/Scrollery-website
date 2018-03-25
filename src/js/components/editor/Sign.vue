<template>
    <span class="sign"
      @click="onClick"
      :class="signClasses"
    >
      <span v-if="showReconstructedStart" class="reconstruction-start">[</span>
      <span class="sign-value" :class='{whitespace: isWhitespace}'>{{isWhitespace ? '  ' : sign.sign}}</span>
      <span v-if="showReconstructedEnd" class="reconstruction-end">]</span>
    </span>
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
    focusedSignId: {
      type: Number,
      required: false,
      default: -1
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
     * Whether or not the sign is currently in focus
     */
    isInFocus() {
      return this.sign.id === this.focusedSignId;
    },

    /**
     * Whether or not to show the current sign is a whitespace-type sign
     */
    isWhitespace() {
      return this.sign.isWhitespace();
    },
    
    /**
     * Reconstruction start should be shown if this sign is reconstructed
     * and it's not preceded by a reconstructed sign. 
     */
    showReconstructedStart() {
      return this.sign.reconstructed() && (
        !this.sign.hasPrevious() || !this.sign.previous().reconstructed()
      )
    },

    /**
     * Reconstruction end should be shown if this sign is reconstructed
     * and it's not followed by a reconstructed sign. 
     */
    showReconstructedEnd() {
      return this.sign.reconstructed() && (
        !this.sign.hasNext() || !this.sign.next().reconstructed()
      )
    },

    /**
     * @return {object} a plain object with Vue-compatible classes and relevant conditions
     */
    signClasses() {
      return {
        complete: !this.sign.is_reconstructed,
        visible: this.isVisible,
        focused: this.isInFocus,
        reconstructed: this.sign.is_reconstructed, 
        incomplete_clear: this.sign.readability === attributes.readability.incomplete.clear,
        incomplete_not_clear: this.sign.readability === attributes.readability.incomplete.unclear
      }
    }
  },
  methods: {

    /**
     * @param {MouseEvent} event  The DOM event
     */
    onClick(event) {
      event.preventDefault();
      this.$emit('click', this.sign)
    }
  }
}
</script>

<style lang="scss" scoped>
.sign {
  visibility: hidden;
  font-family: 'SBL Hebrew';
  font-size: 0;
  letter-spacing: .4px;
  white-space: nowrap;

  & span {
    font-size: 22px;
  }
}

@keyframes blink {
  from, to {border-color:black}
  50%{border-color:transparent}
}

.sign.focused > .sign-value {
  margin-right: -1px;
  border-right: 1px solid black;
  animation: 1s blink step-end infinite;
}

.sign.visible {
  visibility: visible;
}

.sign-value.whitespace {
  display: inline-block;
  position: relative;
    top: -3px;
  height: 22px;
  width: 7px;
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