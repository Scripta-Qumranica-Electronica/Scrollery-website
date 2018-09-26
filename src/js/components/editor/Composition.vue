<!--Do we really need this at all?-->
<template>
    <section class="editor">
      <column
        :state="state"
        :toolbarDialogVisible="toolbarDialogVisible"
        :messageBar="messageBar"
        :corpus="corpus"
      />
    </section>
</template>

<script>
import MessageBar from './MessageBar.vue'
import Column from './Column.vue'

export default {
  components: {
    column: Column,
    'message-bar': MessageBar,
  },
  props: {
    state: {
      required: true,
    },
    toolbar: null,
    messageBar: null,
    corpus: undefined,
    toolbarDialogVisible: undefined,
  },
  computed: {},
}
</script>

<style lang="scss" scoped>
@import '~sass-vars';

.editor {
  position: relative;
  overflow: hidden;
  background-color: rgba($ltOrange, 0.1);
  width: 100%;
  height: calc(100% - 32px);

  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
