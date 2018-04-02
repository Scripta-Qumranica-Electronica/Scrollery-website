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
      console.log(e)
    },

    processMetaInput(e) {
      switch(e.keyCode) {

        /* disallowed actions */
        case KEYS.ALPHA.I: // meta + i = italic
        case KEYS.ALPHA.B: // meta + b = bold
          e.preventDefault()
          break;
      }
    },

    insertLineAtSelection(e) {
      let { line, node } = this.getSelection()

      // whereas the line model still reflects the previous state
      // the node should be the newly inserted bit.
      let newLine = this.column.splitLine(line, (line.length - node.innerText.length + 1))

      // update the lineId on the DOM for next use
      node.dataset.lineId = newLine.getID()
    },

    onCopy(e) {
      // console.log('c', e)
    },
    onPaste(e) {
      // console.log('p', e)
    },
    onInput(e) {
      console.log(e)

      switch (e.inputType) {
        case "insertParagraph":
          this.insertLineAtSelection(e)
          break;
        default:
      } 
      // get the text node and corresponding line model
      // let {node, line} = this.getSelection()

      // the Line model will be diffed against the DOM. Therefore,
      // inserts/deletes to the data will be to bring it into
      // alignment with the DOM which currently represents
      // the users intention for that line.
      // let diffs = diff(line.toString(), node.innerText)

      // console.log(diffs)
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

  &:focus {
    outline: 0 solid transparent;
  }

  & p {
    padding-right: 7px;

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