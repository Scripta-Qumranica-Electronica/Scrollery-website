<template>
    <section class="editor">
      <column v-for="(column, columnIndex) of columns" :key="columnIndex + column.id" :state="state" :column="column" @persist-error="refresh" /></column>
    </section>
</template>

<script>
import Composition from '~/models/Composition.js'
import Column from './Column.vue'

export default {
  components: {
    column: Column,
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
  },
  methods: {
    refresh() {
      this.$emit('refresh')
    },
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
  height: 100%;
}
</style>
