<template>
  <el-dialog title="Editor" :visible="dialogVisible" width="90vw" height="90vh" class="editor-dialog" @close="$emit('close')">

    <!-- Display the sign in context of the line -->
    <div class="line-subheader">
      <div class="sign text-sbl-hebrew" dir="rtl">
        <span v-html="signText"></span>
      </div>
      <div class="line text-sbl-hebrew" dir="rtl">
          <span v-for="s in signs" class="line-sign" :class='{"edited-sign": (s.getID() === sign.getID())}' @click="changeSign(s)">{{ s.isWhitespace() ? ' ' : s.toDOMString() }}</span>
      </div>
    </div>

    <!-- Comments -->
    <div 
      v-show="selectAttribute && selectedSignChar" 
      class="comments-editor">
      <comments-editor
        @addComment="addComment"
        @deleteComment="deleteComment" />
    </div>
    <div v-show="!selectAttribute || !selectedSignChar" class="comments-editor">
        Select a sign and attribute to add a comment.
    </div>

    <!-- Editor Tabs -->
    <el-tabs v-model="activeName">
      <el-tab-pane label="Sign Attributes" name="attributes">
        <tab>
          <attributes-editor :sign="sign" @selectAttribute="selectAttribute"></attributes-editor>
        </tab>
      </el-tab-pane>
      <el-tab-pane label="ROI" title="Regions of Interest" name="roi">
          <tab>ROI</tab>
      </el-tab-pane>
      <el-tab-pane label="Parallels" name="parellels">
          <tab>Parallels</tab>
    </el-tab-pane>
      <el-tab-pane label="Variants" name="variants">
          <tab>Variants</tab>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script>
// components
import Tab from './Tab.vue'
import AttributesEditor from './attributes/AttributesEditor.vue'
import CommentsEditor from './CommentsEditor.vue'

/**
 * A tabbed dialog to support editing of Signs/Words/Lines
 */
export default {
  components: {
    tab: Tab,
    'attributes-editor': AttributesEditor,
    'comments-editor': CommentsEditor,
  },
  props: {
    dialogVisible: {
      default: false,
    },
    line: {
      default: null,
    },
    sign: {
      default: null,
    },
  },
  data() {
    return {
      activeName: 'attributes',
      selectedAttribute: undefined,
      selectedSignChar: undefined,
    }
  },
  computed: {
    /**
     * @type {array.<Sign>}
     */
    signs() {
      return this.line ? this.line.items() : []
    },

    /**
     * The current sign as a DOM string
     * @type {string}
     */
    signText() {
      return this.sign ? this.sign.toDOMString() : ''
    },

    /**
     * The signs in the line
     * @type {number}
     */
    signIndex() {
      return this.line && this.sign ? this.line.findIndex(this.sign) : -1
    },
  },
  methods: {
    /**
     * @param {Sign} sign  the sign to switch to
     */
    changeSign(sign) {
      this.selectedAttribute = undefined
      this.selectedSignChar = undefined
      this.$emit('change-sign', sign)
    },
    selectAttribute(attribute) {
      if (attribute >= 0) {
        this.selectedAttribute = attribute
        // We need a more reliable way to know whis sign_char_id is intended
        // when there is more than one.
        this.selectedSignChar = this.sign.chars._items[0].sign_char_id
      } else {
        this.selectedAttribute = undefined
        this.selectedSignChar = undefined
      }
    },
    addComment(commentary) {
      if (this.selectedSignChar && this.selectedAttribute) {
        const payload = {
          transaction: 'addSignCharAttributeCommentary',
          scroll_version_id: this.$route.params.scrollVersionID,
          sign_char_id: this.selectedSignChar,
          attribute_id: this.selectedAttribute,
          commentary: commentary,
        }
        this.$store.commit('addWorking')
        this.$post('resources/cgi-bin/scrollery-cgi.pl', payload)
          .then(res => {
            this.$store.commit('delWorking')
          })
          .catch(err => {
            this.$store.commit('delWorking')
            console.error(err)
          })
      }
    },
    deleteComment() {
      // if (this.selectedSignChar && this.selectedAttribute) {
      //   const payload = {
      //     transaction: 'removeSignCharAttributeCommentary',
      //     scroll_version_id: this.$route.params.scrollVersionID,
      //     sign_char_id: this.selectedSignChar,
      //     attribute_id: this.selectedAttribute,
      //     sign_char_commentary_id: //I don't have this yet,
      //   }
      //   this.$store.commit('addWorking')
      //   this.$post('resources/cgi-bin/scrollery-cgi.pl', payload)
      //     .then(res => {
      //       this.$store.commit('delWorking')
      //      })
      //     .catch(err => {
      //       this.$store.commit('delWorking')
      //       console.error(err)
      //     })
      // }
    },
  },
}
</script>

<style lang="scss">
.editor-dialog {
  & .el-dialog {
    margin-top: 5vh !important;
  }

  & .el-dialog__header {
    padding: 10px;
  }

  & .el-dialog__body {
    padding: 0 10px 20px 10px;
  }

  & .el-dialog__headerbtn {
    top: 10px;
    right: 10px;
  }

  & .line-subheader {
    font-size: 20px;

    & .sign {
      margin-bottom: 5px;
      font-size: 26px;
    }

    & p {
      white-space: wrap;
    }
  }

  & .line {
    & .line-sign {
      display: inline-block;
      font-size: 20px;
      min-width: 6px; // needed for whitespace

      &.edited-sign,
      &:hover {
        border-bottom: 0.5px solid #000;
      }
    }
  }
}

.comments-editor {
  height: 20vh;
  min-height: 200px;

  /* needed to clear tabs */
  margin-bottom: 40px;
}
</style>
