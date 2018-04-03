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
import diff from '~/utils/StringDiff.js'

// components
import TextLine from './Line.vue'

// models
import Column from '~/models/Column.js'
import Line from '~/models/Line.js'
import Sign from '~/models/Sign.js'

export default {
  components: {
    'text-line': TextLine
  },
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
     * Resets the DOM against the model
     * 
     * This causes the document to lose history
     */
    reset() {
      this.colHtmlString = this.column.toDOMString()
    },

    /**
     * For contenteditable divs, the only place we can stop input ... is before keyup
     * 
     * Thus, we can intercept some events here, and stub in our own if need be.
     */
    onKeydown(e) {
      if (!e.isTrusted) {
        e.preventDefault()
      }

      if (e.metaKey) {
        this.processMetaInput(e)
      }
    },

    /**
     * @param {KeyboardEvent} e triggered event
     */
    processMetaInput(e) {
      switch(e.keyCode) {

        /* disallowed actions */
        case KEYS.ALPHA.I: // meta + i = italic
        // case KEYS.ALPHA.B: // meta + b = bold
          e.preventDefault()
          break;
      }
    },

    /**
     * Synchronizes the model with a new line
     * 
     * @param {KeyboardEvent} e triggered event
     */
    insertLineAtSelection(e) {
      let { line, node } = this.getSelection()

      // whereas the line model still reflects the previous state
      // the node should be the newly inserted bit.
      let newLine = this.column.splitLine(line, (line.length - node.innerText.length))

      // update the lineId on the DOM for next use
      node.dataset.lineId = newLine.getID()
    },

    /**
     * @param {InputEvent} e
     */
     signsChanged(e) {

      // get the text node and corresponding line model
      let {node, line} = this.getSelection()

      // the Line model will be diffed against the DOM. Therefore,
      // inserts/deletes to the data will be to bring it into
      // alignment with the DOM which currently represents
      // the users intention for that line.
      let diffs = diff(line.toString().replace(/\s/g, '&nbsp;'), node.innerText.replace(/\s/g, '&nbsp;'))

      let diffIndex = 0
      for (let i = 0, n = diffs.length; i < n; i++) {

        // each diff in the array takes this shape:
        // [code = 0, 1, -1, change = 'string difference']
        let d = diffs[i]
        switch (d[0]) {

          // no change, simply increment up our string index
          case diff.EQUAL:
            diffIndex = diffIndex + d[1].length
            break;

          // there's been (a) sign(s) inserted
          case diff.INSERT:
            d[1].split('').forEach(sign => {
              diffIndex++
              line.insert(new Sign({ sign }), diffIndex)
            })
            break; 

          // there's been a sign deleted
          case diff.DELETE:
            d[1].split('').forEach(() => line.delete(diffIndex))
            break;
        }
      }
    },

    /**
     * @param {InputEvent} e
     */
    signsRemoved(e) {

      // removal could mean lines removes, or simply a character
      let {node, line} = this.getSelection()

      // determine if the lines are the same as the count of <p> elements
      // if not, then a line was deleted/merged into 
      if (node.parentElement.children.length !== this.column.length) {
        
        // TODO: handle line deleted

      } else {

        // this was a simple removal of a sign, we can handle that
        // via a signsChanged to diff the DOM
        this.signsChanged(e)
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
        case "insertParagraph":
          this.insertLineAtSelection(e)
          break;

        /* handle chars changed (insert/remove) together */
        case "insertText":
          this.signsChanged(e)
          break
        case "deleteContentBackward":
          this.signsRemoved(e)
          break;
        default:
          console.log('unhandle input event', e)
      }
    },

    /**
     *
     */
    getSelection() {
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