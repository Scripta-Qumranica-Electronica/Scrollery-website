<template>
  <el-dialog :visible="dialogVisible" width="90vw" height="90vh" class="editor-dialog" @close="$emit('close')">
    <template slot="title">
      <span>Editor</span>
      <i 
        v-show="working > 0" 
        class="fa fa-spinner fa-spin fa-fw" 
        aria-hidden="true"
        style="color: black"></i>
    </template>

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
        :initialText="currentComment"
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
import { mapGetters } from 'vuex'
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
      selectedCommentary: undefined,
      currentComment: '',
    }
  },
  computed: {
    ...mapGetters(['working']),

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
        // We have to loop through the attributes to find the sign_char_id
        // and whether or not a comment exists.
        for (let i = 0, signChar; (signChar = this.sign.chars._items[i]); i++) {
          for (let n = 0, attr; (attr = signChar.attributes._items[n]); n++) {
            if (attr.attribute_id === this.selectedAttribute) {
              this.selectedSignChar = signChar.sign_char_id
              if (attr.commentary_id) {
                this.$store.commit('addWorking')
                this.$post('resources/cgi-bin/scrollery-cgi.pl', {
                  transaction: 'getSignCharAttributeCommentary',
                  scroll_version_id: this.$route.params.scrollVersionID,
                  sign_char_commentary_id: attr.commentary_id,
                })
                  .then(res => {
                    this.currentComment = res.data[attr.commentary_id]
                    this.selectedCommentary = attr.commentary_id
                    this.$store.commit('delWorking')
                  })
                  .catch(err => {
                    this.$store.commit('delWorking')
                    console.error(err)
                  })
              } else {
                this.currentComment = ''
              }
              break
            }
          }
        }
      } else {
        this.selectedAttribute = undefined
        this.selectedSignChar = undefined
      }
    },

    addComment(commentary) {
      if (this.selectedSignChar && this.selectedAttribute) {
        if (this.selectedCommentary) {
          this.removeCommentFromDB(this.selectedCommentary)
            .then(res => {
              return this.insertCommentToDB(commentary)
            })
            .catch(err => {
              console.error(err)
            })
        } else {
          this.insertCommentToDB(commentary).catch(err => {
            console.error(err)
          })
        }
      }
    },

    deleteComment() {
      if (this.selectedCommentary) {
        this.removeCommentFromDB(this.selectedCommentary).catch(err => {
          console.error(err)
        })
      }
    },

    insertCommentToDB(commentary) {
      return new Promise((resolve, reject) => {
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
            this.currentComment = commentary
            resolve(res)
          })
          .catch(err => {
            this.$store.commit('delWorking')
            reject(err)
          })
      })
    },

    removeCommentFromDB(commentary_id) {
      return new Promise((resolve, reject) => {
        this.$post('resources/cgi-bin/scrollery-cgi.pl', {
          transaction: 'removeSignCharAttributeCommentary',
          scroll_version_id: this.$route.params.scrollVersionID,
          sign_char_commentary_id: commentary_id,
        })
          .then(res => {
            this.$store.commit('delWorking')
            if (res.data[commentary_id] === 'deleted') {
              this.currentComment = ''
              this.selectedCommentary = undefined
              resolve(res)
            }
          })
          .catch(err => {
            this.$store.commit('delWorking')
            reject(err)
          })
      })
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
