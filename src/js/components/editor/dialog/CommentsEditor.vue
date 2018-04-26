<template>
  <div class="comments-wrapper">
    <div :data-id="id"></div>
  </div>
</template>

<script>
import Quill from 'quill'
import uuid from 'uuid/v1'

export default {
  data() {
    return {
      id: uuid(),
      quill: null,
    }
  },
  mounted() {
    this.quill = new Quill(`[data-id="${this.id}"]`, {
      theme: 'snow',
    })
  },
}
</script>

<style lang="scss">
@import '~@/node_modules/quill/dist/quill.snow.css';

.comments-wrapper {
  height: 100%;
}
</style>
