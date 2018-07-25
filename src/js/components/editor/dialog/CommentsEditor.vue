<template>
  <div class="comments-wrapper">
    <div :ref="id"></div>
  </div>
</template>

<script>
import Quill from 'quill'
import uuid from 'uuid/v1'

export default {
  props: {
    initialText: '',
  },
  data() {
    return {
      id: uuid(),
      quill: null,
    }
  },
  mounted() {
    /**
     * The following code is based on: https://codepen.io/anon/pen/rrzpGx
     * and https://github.com/quilljs/quill/issues/1560.
     */
    const toolbarOptions = {
      container: [
        // ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        // [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        // [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        // ['clean'],                                         // remove formatting button
        ['commit'],
        ['delete'],
      ],
      handlers: {
        commit: () => {
          /* istanbul ignore next */
          this.commitComment()
        },
        delete: () => {
          /* istanbul ignore next */
          this.deleteComment()
        },
      },
    }

    this.quill = new Quill(this.$refs[this.id], {
      modules: {
        toolbar: toolbarOptions,
      },
      theme: 'snow',
    })
    this.quill.setText(this.initialText)
    this.quill.on('selection-change', (range, oldRange, source) => {
      if (range) {
        // if (range.length == 0) {
        //   console.log('User cursor is on', range.index);
        // } else {
        //   var text = quill.getText(range.index, range.length);
        //   console.log('User has highlighted', text);
        // }
      } else {
        this.commitComment()
      }
    })
  },
  methods: {
    commitComment() {
      this.$emit('addComment', this.quill.getText(0))
    },
    deleteComment() {
      this.$emit('deleteComment')
    },
  },
  watch: {
    initialText(to, from) {
      to !== from && this.quill.setText(to)
    },
  },
}
</script>

<style lang="scss">
@import '~@/node_modules/quill/dist/quill.snow.css';

.comments-wrapper {
  height: 100%;
}
.ql-commit:after {
  color: green;
  font-family: FontAwesome;
  content: '\f00c';
}
.ql-delete:after {
  color: red;
  font-family: FontAwesome;
  content: '\f05e';
}
</style>
