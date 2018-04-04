<template>
  <div style="{width: 100%; height: 100%;}">
    <el-row class="combination-panel-menu" style="{width: 100%; height 30px;}">
        <el-col :span="4">
            <label>Zoom</label>
        </el-col>
        <el-col :span="4">
            <el-slider  
                v-model="scale"
                :min="1"
                :step="0.5"
                :max="100"
                :format-tooltip="formatTooltip">
            </el-slider>
        </el-col>
    </el-row>
    <div style="{width: 100%; height: calc(100% - 38px); overflow: auto;}">
        <combination-canvas :global-scale="globalScale"></combination-canvas>
    </div>
  </div>
</template>

<style lang="scss" scoped>
    @import "~sass-vars";

    .combination-panel-menu {
        background: #dedede;
    }
</style>


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