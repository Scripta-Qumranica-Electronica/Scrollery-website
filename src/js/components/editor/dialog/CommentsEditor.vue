<template>
  <div class="comments-wrapper">
    <div :data-id="id"></div>
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
        commit: () => this.commitComment(),
        delete: () => this.deleteComment(),
      },
    }

    this.quill = new Quill(`[data-id="${this.id}"]`, {
      modules: {
        toolbar: toolbarOptions,
      },
      theme: 'snow',
    })
    this.quill.setText(this.initialText)
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
      if (to !== from) {
        this.quill.setText(to)
      }
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
