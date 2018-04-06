<template>
  <div class="editor-column">
    <div class="text-col inline text-sbl-hebrew" dir="rtl" contenteditable="true" @keydown="onKeydown" @input="onInput" @paste="onPaste" @copy="onCopy" v-html="colHtmlString">
    </div><div class="line-number-col inline">
        <p class="line-number" v-for="(line, lineIndex) of column.items()" :key="line.id">{{ lineIndex + 1 }}</p>
    </div>
  </div>
</template>

<script>
import KEYS from './key_codes.js'

// models
import Column from '~/models/Column.js'
import Line from '~/models/Line.js'
import Sign from '~/models/Sign.js'

export default {
  data() {
    return {
      colHtmlString: ""
    }
  },
  props: {
    column: {
      required: true,
      type: Column
    },
    state: {
      required: true
    }
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
          text: child.innerText
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

      // safeguard: ensure trusted input
      if (!e.isTrusted) {
        e.preventDefault()
      }

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
      switch(e.keyCode) {

        /* disallowed actions */
        case KEYS.ALPHA.I: // meta + i = italic
        case KEYS.ALPHA.B: // meta + b = bold
          e.preventDefault()
          break;
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
      let newLine = this.column.splitLine(line, (line.length - node.innerText.length))

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
    onCopy(e) {
      // console.log('c', e)
    },

    /**
     * @param {KeyboardEvent} e triggered event
     */
    onPaste(e) {
      // console.log('p', e)
    },

    /**
     * @param {InputEvent} e triggered event
     */
    onInput(e) {

      switch (e.inputType) {

        // inserted block/paragraph
        case "insertParagraph":
          this.insertLineAtSelection(e, this.getLineSelection())
          break;

        // inserted chars
        case "insertText":
          this.signsChanged(e, this.getLineSelection())
          break

        // deleted content. Could be line or single char
        case "deleteContentBackward":
          this.signsRemoved(e, this.getLineSelection())
          break;

        // for now, just log out what we're missing
        default:
          console.log('unhandle input event', e)
      }
    },

    /**
     * @returns {object} with this shape: {
     *  line: {Line} the line model, where applicable
     *  node: {HtmlElement} the DOM element corresponding to the line
     * }
     */
    getLineSelection() {
      let selectedNode = document.getSelection()

      // safeguard to ensure a workable DOM element is available
      if (!selectedNode || !selectedNode.anchorNode) {
        return {}
      }

      return this.getLineParent(selectedNode.anchorNode)
    },

    /**
     * @param {Node} domNode a dom node to find the correlated parent
     */
    getLineParent(domNode, init) {
      if (domNode.tagName === "P" && domNode.dataset && domNode.dataset.lineId !== undefined) {
        const id = Number(domNode.dataset.lineId)
        return {
          init: init,
          node: domNode,
          line: this.column.find(line => line.id === id)
        }
      }

      // recurse up the DOM
      return domNode.parentElement ? this.getLineParent(domNode.parentElement, init || domNode) : null
    }
  },
  mounted() {
    this.reset()
  }
}
</script>

<style lang="scss">

@import "~sass-vars";

.editor-column {
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