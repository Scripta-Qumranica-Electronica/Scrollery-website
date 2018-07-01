<template>
    <section class="editor">
      <column
        v-for="(column, columnIndex) of columns"
        :key="columnIndex + column.id"
        :state="state"
        :column="column"
        :toolbar="toolbar"
        :messageBar="messageBar"
        @refresh="$emit('refresh')"
      />
    </section>
</template>

<script>
import MessageBar from './MessageBar.vue'
import Composition from '~/models/Composition.js'
import Column from './Column.vue'

export default {
  components: {
    column: Column,
    'message-bar': MessageBar,
  },
  props: {
    text: {
      default() {
        return new Composition()
      },
    },
    state: {
      required: true,
    },
    toolbar: null,
    messageBar: null,
  },
  computed: {
    columns() {
      return this.text.items()
    },
  },
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
