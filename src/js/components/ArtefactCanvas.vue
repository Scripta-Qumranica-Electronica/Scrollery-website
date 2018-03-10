<template>
  <div :width="width" :height="height" :style="{transform: `scale(${scale})`}">
    <canvas :width="width" :height="height"></canvas>
  </div>
</template>

<script>
export default {
  props: {
    mask: {},
    width: 0,
    height: 0,
    scale: '',
    drawMode: '',
    brushSize: 0,
  },
  data() {
    return {
        
    }
  },
  methods: {

  }
}
</script>

<style lang="scss" scoped>
</style>

