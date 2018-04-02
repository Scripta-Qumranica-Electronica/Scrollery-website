<template>
    <p :data-line="line.line" :data-line-id="line.id" :data-line-index="index">{{ text }}</p>
</template>

<script>
import Line from '~/models/Line.js'

export default {
  props: {
    line: {
      required: true,
      type: Line
    },
    index: {
      required: true,
      type: Number
    },
    state: {
      default: null
    }
  },
  computed: {
    text() {
      return this.line.toString();
    }
  }
} 
</script>