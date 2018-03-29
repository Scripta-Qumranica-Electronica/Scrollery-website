<template>
  <div class="toolbar">
    <el-dropdown :hide-on-click="true" trigger="click" @command="handleFontChange">
      <span class="el-dropdown-link">
        {{ fontName }} <i class="el-icon-arrow-down el-icon--right"></i>
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
  data() {
    const i18n = {
      handOf: this.$i18n.str("Editor.HandOf"),
      default: this.$i18n.str("Global.Default") 
    }

    // todo: move into store
    return {
      fontName: 'SBL Hebrew',
      fonts: {
        'SBL Hebrew': {
          name: 'SBL Hebrew',
          class: 'text-sbl-hebrew',
          label: `SBL Hebrew (${i18n.default})` 
        },
        '4Q416': {
          name: '4Q416',
          class: 'text-4Q416',
          label: `${i18n.handOf} 4Q416`
        },
        '4Q417': {
          name: '4Q417',
          class: 'text-4Q417',
          label: `${i18n.handOf} 4Q417`
        },
        '4Q418': {
          name: '4Q418',
          class: 'text-4Q418',
          label: `${i18n.handOf} 4Q418`
        },
        '4Q503': {
          name: '4Q503',
          class: 'text-4Q503',
          label: `${i18n.handOf} 4Q503`
        },
        'cryptic': {
          name: 'Cryptic',
          class: 'text-cryptic',
          label: 'Cryptic'
        }
      }
    }
  },
  methods: {
    toggleReconstructedText() {
      this.state.getters.showReconstructedText
        ? this.state.commit('hideReconstructedText')
        : this.state.commit('showReconstructedText')
    },
    handleFontChange(font) {
      if (this.fonts[font]) {
        this.fontName = font
        this.state.commit('setFont', this.fonts[font])
      }
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
