<template>
  <div class="toolbar">
      <button class="toolbar-item" @click="toggleReconstructedText" v-bind:title="$i18n.str('Editor.ToggleReconstructedText')">
          <i v-show="state.getters.showReconstructedText" class="fa fa-eye" aria-hidden="true"></i>
          <i v-show="!state.getters.showReconstructedText" class="fa fa-eye-slash" aria-hidden="true"></i>
      </button>
      <button class="toolbar-item" @click="$emit('fullscreen')" v-bind:title="$i18n.str('Editor.Fullscreen')">
          <i class="fa fa-arrows-alt" aria-hidden="true"></i>
      </button>
  </div>
</template>

<script>

import { Store } from 'vuex'

export default {
  props: {
    state: {
      type: Store,
      required: true
    }
  },
  methods: {
    toggleReconstructedText() {
      this.state.getters.showReconstructedText
        ? this.state.commit('hideReconstructedText')
        : this.state.commit('showReconstructedText')
    }
  }
}
</script>

<style lang="scss" scope>

@import "~sass-vars";

.toolbar {
  text-align: right;
  padding: 1px 10px;
  height: 30px;
  background: rgba($gray, .2);
  font-size: 0;
}

.toolbar-item {
  font-size: 20px;
}

</style>
