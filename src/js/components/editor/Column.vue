<template>
  <div class="editor-column">
    <div
      class="text-col inline text-sbl-hebrew"
      dir="rtl" 
      :contenteditable="isEditable"
      ref="colNode"
      @keydown="onKeydown" 
      @input="onInput"
      @paste="onPaste"
      @copy="onCopy"
      @cut="onCut"
      v-html="colHtmlString"
    >
    </div><div class="line-number-col inline">
        <p class="line-number" v-for="(line, lineIndex) of column.items()" :key="line.id">{{ lineIndex + 1 }}</p>
    </div>
    <editing-dialog
      :line="dialogLine"
      :sign="dialogSign"
      :dialogVisible="dialogVisible"
      @close="onDialogClosed"
      @change-sign="onDialogChangeSign"
    />
  </div>
</template>

<script>
import KEYS from './key_codes.js'

// components
import EditingDialog from './dialog/EditingDialog.vue'

// controllers
import ColumnPersistanceService from '~/controllers/column-persistance-service.js'

// models
import Column from '~/models/Column.js'
import Line from '~/models/Line.js'
import Sign from '~/models/Sign.js'

export default {
  components: {
    'editing-dialog': EditingDialog,
  },
  data() {
    return {
      colHtmlString: '',

      // props that will be passed into the editor dialog
      dialogSign: null,
      dialogLine: null,
      dialogVisible: false,
    }
  },
  props: {
    column: {
      required: true,
      type: Column,
    },
    state: {
      required: true,
    },
    messagebar: null,
    toolbar: null,
  },
  computed: {
    isEditable() {
      return !this.state.getters.locked
    },
  },
  methods: {
    /**
     * The converse of reset. Synchronize the column model to the current DOM column
     *
     * @param {HTMLElement} colNode  the DOM element corresponding to this column
     */
    synchronize(colNode) {
      // first, gather up the target represenation from the DOM
      let target = []
      for (let i = 0, n = colNode.children.length; i < n; i++) {
        let child = colNode.children[i]
        target.push({
          id: child.dataset.lineId,
          text: child.innerText,
        })
      }
      // second, apply to the column model
      this.column.synchronizeTo(target)
    },

    /**
     * For contenteditable divs, the only place we can stop input ... is before keyup
     *
     * Thus, we can intercept some events here, and stub in our own if need be.
     */
    onKeydown(e) {
      if (e.metaKey) {
        this.processMetaInput(e)
      }
    },

    /**
     * Handle meta-key inputs (exact meta key varies by OS. Thes are usually hot keys,
     *
     * OS:
     *  - mac: CMD + key
     *  - windows: ctl + key
     *
     * @param {KeyboardEvent} e triggered event
     */
    processMetaInput(e) {
      switch (e.keyCode) {
        /* disallowed actions */
        case KEYS.ALPHA.I: // meta + i = italic
        case KEYS.ALPHA.B: // meta + b = bold
          e.preventDefault()
          break

        case KEYS.ALPHA.O: // meta + o = open dialog
          this.openDialog(e)
          break
      }
    },

    /**
     * Synchronizes the model with a new line
     *
     * @param {KeyboardEvent} e triggered event
     */
    insertLineAtSelection(e, { line, node }) {
      // whereas the line model still reflects the previous state
      // the node should be the newly inserted bit.
      let newLine = this.column.splitLine(line, line.length - node.innerText.length)

      // update the lineId on the DOM for next use
      node.dataset.lineId = newLine.getID()
    },

    /**
     * @param {InputEvent} e
     */
    signsChanged(e, { line, node }) {
      // synchronize the line > DOM
      line.synchronizeTo(node.innerText)
    },

    /**
     * @param {InputEvent} e
     */
    signsRemoved(e, { line, node }) {
      // determine if the lines are the same as the count of <p> elements
      // if not, then a line was deleted/merged into
      if (node.parentElement.children.length !== this.column.length) {
        this.synchronize(node.parentElement)
      } else {
        // this was a simple removal of a sign, we can handle that
        // via a signsChanged to diff the DOM
        this.signsChanged(e, { line, node })
      }
    },

    /**
     * @param {KeyboardEvent} e triggered event
     */
    onCut(e) {
      this.onCopy(e)
      document.execCommand('delete', true)
      this.synchronize(this.$refs.colNode)
    },

    /**
     * @param {KeyboardEvent} e triggered event
     */
    onCopy(e) {
      // override default copy behavior
      e.preventDefault()

      // grab the document selection
      const { focusOffset, anchorOffset, type } = document.getSelection()

      // the user hasn't selected any text. ignore
      if (type === 'Caret') {
        return
      }

      const { line, node } = this.getSelection()
      let transfer = {
        text: '',
        signs: [],
      }
      let startOffset = focusOffset < anchorOffset ? focusOffset : anchorOffset
      let end = focusOffset > anchorOffset ? focusOffset : anchorOffset
      for (let offset = startOffset; offset < end; offset++) {
        let sign = line.get(offset)
        transfer.text = transfer.text + sign.toString()
        transfer.signs.push(sign)
      }

      e.clipboardData.setData('text/plain', JSON.stringify(transfer))
    },

    /**
     * @param {KeyboardEvent} e triggered event
     */
    onPaste(e) {
      e.preventDefault()

      let text = e.clipboardData.getData('text/plain')

      // If the string matches this pattern [{ ... }], we most likely have a stringified JSON array,
      // in which case, the user is copying from another place in the editor
      if (/^\{/.test(text) && /\}$/.test(text)) {
        try {
          const transferData = JSON.parse(text)
          text = transferData.text

          // TODO for later
          // transferData.sign contains a stringified copy of the signs that contains
          // their attributes and chars and whatnot.
        } catch (err) {
          this.messagebar.flash('Paste attempt could not be processed.', {
            type: 'error',
          })
        }
      }

      document.execCommand('insertText', true, text)

      // let sel = document.getSelection()
      // let range = sel.getRangeAt(0)
      // range.deleteContents()
      // range.insertNode(document.createTextNode(text))
    },

    /**
     * @param {InputEvent} e triggered event
     */
    onInput(e) {
      switch (e.inputType) {
        case 'insertParagraph': // inserted block/paragraph
        case 'deleteContentBackward': // deleted content. Could be line or single char
        case 'insertText': // inserted chars
        case 'historyUndo': // ctl-z undo
        case 'historyRedo': // ctl-y redo
          this.synchronize(this.$refs.colNode)
          break

        // for now, just log out what we're missing
        default:
          console.log('unhandle input event', e)
          this.$emit('warning', {
            message: 'An unhandle input event was received.',
          })
      }
    },

    /**
     * Convenience method for retrieving the selected DOM node and corresponding models
     *
     * @returns {object} with this shape: {
     *  line: {Line} the line model, where applicable
     *  node: {HtmlElement} the DOM element corresponding to the line
     * }
     */
    getSelection() {
      const selection = document.getSelection()

      // safeguard to ensure a workable DOM element is available
      return !selection || !selection.anchorNode
        ? {}
        : this.getLineParent(selection.anchorNode, null, selection)
    },

    /**
     * A recursive method
     *
     * @param {Node} domNode        a dom node to find the correlated parent
     * @param {Node} init           the initial dom node (usually selection.anchorNode)
     * @param {Selection} selection The full selection object
     *
     * @returns {object} An object containing the initial dom node, line model, sign model,
     */
    getLineParent(domNode, init, selection) {
      if (domNode.tagName === 'P' && domNode.dataset && domNode.dataset.lineId !== undefined) {
        // determine the line ID from the HTML dataset
        const id = Number(domNode.dataset.lineId)

        // find the line model
        const line = this.column.find(line => line.id === id)
        return {
          init,
          line: line || null,
          sign: line ? line.get(selection.focusOffset) : null,
          node: domNode,
          selection,
        }
      }

      // recurse up the DOM
      return domNode.parentElement
        ? this.getLineParent(domNode.parentElement, init || domNode, selection)
        : null
    },

    /**
     * Attemps to open the dialog
     *
     * @param {KeyboardEvent} [e] triggered event
     */
    openDialog(e) {
      // prevent whatever action got us here.
      // custom logic will take over
      e && e.preventDefault()

      const { line, sign, selection } = this.getSelection()

      // todo: show UI error
      if (!line || !sign) {
        console.error('Unable to open dialog. Something has broken')
        return
      }

      this.dialogLine = line
      this.dialogSign = sign
      this.dialogVisible = true
    },

    /**
     * Handle when the editing dialog is closed
     *
     * @param {mixed} args  The event args
     */
    onDialogClosed() {
      this.dialogLine = null
      this.dialogSign = null
      this.dialogVisible = false

      // TODO: reset selection to previous point
    },

    /**
     * Handle when the changes it's sign
     *
     * @param {Sign} sign  The event args
     */
    onDialogChangeSign(sign) {
      this.dialogSign = sign
    },

    wireToolbarEvents() {
      this.toolbar.$on('open-sign-editor', () => {
        try {
          !this.dialogVisible && this.openDialog()
        } catch (err) {
          /* swallow */
        }
      })
    },
  },
  mounted() {
    if (this.toolbar) {
      this.wireToolbarEvents()
    }

    this.persistanceService = new ColumnPersistanceService(
      this.column,
      this.$route.params.scrollVersionID,
      this.$store.getters.sessionID
    )
    this.persistanceService.on('error', () => {
      this.messageBar.flash('An error occurred attempting to save your changes.', {
        type: 'error',
        actionText: 'refresh data? (strongly suggested)',
        keepOpen: true,
        actionCallback: () => {
          this.$emit('refresh')
          this.messageBar.close()
        },
      })
    })

    this.persistanceService.on('persisted', () => {
      this.messageBar.flash('All changes saved!', {
        type: 'success',
      })
    })

    setTimeout(() => this.persistanceService.engage(), 200)

    this.colHtmlString = this.column.toDOMString()
  },
  watch: {
    toolbar(toolbar) {
      if (toolbar && (!this._wiredToolbar || toolbar !== this._wiredToolbar)) {
        this._wiredToolbar = toolbar
        this.wireToolbarEvents()
      }
    },
  },
}
</script>

<style lang="scss">
@import '~sass-vars';

.editor-column {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: scroll;

  & p:first-child {
    padding-top: 7px;
  }

  & .text-col p,
  & .line-number-col p {
    margin: 0;
    line-height: 1.25;
    height: 37px;
  }

  &::-webkit-scrollbar {
    display: none;
  }
}

.text-col {
  height: 100%;
  width: 96%;
  overflow-x: scroll;

  &:focus {
    outline: 0 solid transparent;
  }

  & p {
    white-space: nowrap;
    padding: 0 7px;

    &:hover {
      background-color: rgba($ltOrange, 0.1);
    }
  }
}

.line-number-col {
  vertical-align: top;
  overflow: hidden;
  width: 4%;
  height: 100%;
  line-height: 1.25;
  background-color: $dkTan;
  color: #fff;
  text-align: left;
  font-weight: 400;

  & .line-number {
    padding: 0 5px;
  }
}
</style>
