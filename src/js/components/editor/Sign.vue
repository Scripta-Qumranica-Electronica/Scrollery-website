<template>
    <span class="sign"
      :class="signClasses"
      :data-id="sign.id"
      :data-prev-sign-id="sign.prev_sign_id"
      :data-next-sign-id="sign.next_sign_id"
    >
      <span v-if="showReconstructedStart" class="reconstruction-start">[</span>
      <span class="sign-value" :class='{whitespace: isWhitespace}'>{{sign.sign}}</span>
      <span v-if="showReconstructedEnd" class="reconstruction-end">]</span>
    </span>
</template>

<script>

import { Store } from 'vuex'
import Sign from '~/utils/Sign.js'
import attributes from './sign_attributes.js'

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
    }
  },
  computed: {

    /**
     * Whether or not to show the current sign
     */
    visible() {
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

    signClasses() {
      return {
        complete: !this.sign.is_reconstructed,
        visible: this.visible,
        reconstructed: this.sign.is_reconstructed, 
        incomplete_clear: this.sign.readability === attributes.readability.incomplete.clear,
        incomplete_not_clear: this.sign.readability === attributes.readability.incomplete.unclear
      }
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

.sign.visible {
  visibility: visible;
}

.sign-value.whitespace {
  visibility: hidden;
  letter-spacing: 2px;
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