<template>
  <div style="{width: 100%; height: 100%;}">
    <div class="row align-middle" style="{width: 100%; height 50px;}">
        <label class="col-1">Zoom</label>
        <el-slider 
            class="col-1" 
            v-model="scale"
            :min="1"
            :step="0.5"
            :max="100"
            :format-tooltip="formatTooltip">
        </el-slider>
        <!-- <input  class="col-2" 
                type="range" 
                min="0.01" 
                max="1.0" 
                step="0.01" 
                v-model="scale" /> -->
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
        scale: 0.01,
    }
  },
  computed: {
      globalScale() {
        // This returns a logarithmical scale value for
        // the current slider position.
        return parseFloat((((100-1)*Math.pow((this.scale / 100), 3) + 1) / 100).toFixed(4));
      }
  },
  methods: {
      formatTooltip(val) {
          return (this.globalScale * 100).toFixed(2) + '%'
      }
  }
}
</script>