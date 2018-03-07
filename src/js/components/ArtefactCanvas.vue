<template>
    <canvas :width="width" :height="height" :style="{transform: `scale(${scale})`}"></canvas>
</template>

<script>
export default {
  props: {
    mask: {},
    width: '',
    height: '',
    scale: '',
    drawMode: 'draw',
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

