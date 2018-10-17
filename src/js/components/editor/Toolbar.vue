<template>
  <div class="toolbar">
    <div class="toolbar-item float-left">
      <i 
        class="fa locked-icon" 
        :class="{'fa-lock': !is_locked, 'fa-unlock': is_locked}" 
        :style="{color: !is_locked ? 'red' : 'green'}"
      ></i>
    </div>
    <div v-show="$route.params.scrollVersionID !== '~' && $route.params.colID !== '~'" 
      class="toolbar-item float-left">
      <el-button type="primary" size="mini" @click="downloadEpiDoc">Download EpiDoc</el-button>
    </div>
    <div class="inline toolbar-right">
      <button id="editor-fullscreen" class="inline toolbar-item toolbar-button" @click="$emit('open-sign-editor')">
          Open Sign Editor
      </button>
      <el-dropdown :hide-on-click="true" trigger="click" @command="onFontChange">
        <span class="el-dropdown-link">
          {{ font.name }} <i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="(font, key) in fonts" :key="key" :command="key">
            <span>{{ font.label }}</span> <span :class="font.class" dir="rtl">אבגד</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <button class="toolbar-item" @click="toggleReconstructedText" v-bind:title="$i18n.str('Editor.ToggleReconstructedText')">
          <i v-show="state.getters.showReconstructedText" class="fa fa-eye" aria-hidden="true"></i>
          <i v-show="!state.getters.showReconstructedText" class="fa fa-eye-slash" aria-hidden="true"></i>
      </button>
    </div>
    <button id="editor-fullscreen" class="inline toolbar-item" @click="$emit('fullscreen')" v-bind:title="$i18n.str('Editor.Fullscreen')">
        <i class="fa fa-arrows-alt" aria-hidden="true"></i>
    </button>
  </div>
</template>

<script>
import { Store } from 'vuex'
import { parseColumnToEpiDoc } from '~/utils/EpiDocExport.js'
import fileDownload from 'js-file-download'

export default {
  props: {
    corpus: undefined,
    state: {
      type: Store,
      required: true,
    },
  },
  computed: {
    is_locked() {
      return this.corpus.combinations.get(this.$route.params.scrollVersionID) &&
        this.corpus.combinations.get(this.$route.params.scrollVersionID).locked
        ? false
        : true
    },
    /**
     * @type {object} an object representing the current font in use
     */
    fonts() {
      return this.state.getters.fonts
    },

    /**
     * @type {object} an object whose keys are font-keys, and values are font objects
     */
    font() {
      return this.state.getters.font
    },
  },
  methods: {
    toggleReconstructedText() {
      this.state.getters.showReconstructedText
        ? this.state.commit('hideReconstructedText')
        : this.state.commit('showReconstructedText')
    },

    /**
     * @param {string} font  The font key (corresponding to it's key in the state.fonts object)
     */
    onFontChange(font) {
      this.state.commit('setFont', font)
    },

    downloadEpiDoc() {
      parseColumnToEpiDoc(this.corpus, this.$route.params.scrollVersionID, this.$route.params.colID)
        .then(epiDocString => {
          const fileName = `${
            this.corpus.combinations.get(this.$route.params.scrollVersionID).name
          }-${this.$route.params.scrollVersionID}-${
            this.corpus.cols.get(this.$route.params.colID, this.$route.params.scrollVersionID).name
          }.xml`
          fileDownload(epiDocString, fileName)
        })
        .catch(error => console.error(error))
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~sass-vars';

.toolbar {
  text-align: right;
  padding: 1px 10px;
  height: 30px;
  background: rgba($gray, 0.2);
  font-size: 0;
}

.toolbar-item {
  font-size: 20px;
  margin-left: 4px;
  margin-right: 4px;
  margin-top: 1px;
}

.toolbar-button {
  font-size: initial;
}

.locked-icon {
  padding: 5px 0;
}
</style>
