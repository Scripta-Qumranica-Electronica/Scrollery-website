<template>
  <div style="{width: 100%; height: 100%;}">
    <div class="row align-middle" style="{width: 100%; height 50px;}">
        <label class="col-1">Zoom {{globalScale}}</label>
        <input  class="col-2" 
                type="range" 
                min="0.01" 
                max="1.0" 
                step="0.01" 
                v-model="scale" />
    </div>
    <div style="{width: 100%; height: calc(100% - 50px); overflow: auto;}">
        <combination-canvas :global-scale="globalScale"></combination-canvas>
    </div>
  </div>
</template>

<script>
import CombinationCanvas from './CombinationCanvas.vue'
export default {
  components: {
      'combination-canvas': CombinationCanvas,
  },
  data() {
    return {
        scale: 0.1,
    }
  },
  computed: {
      globalScale() {
          return Number(this.scale)
      }
  },
}
</script>