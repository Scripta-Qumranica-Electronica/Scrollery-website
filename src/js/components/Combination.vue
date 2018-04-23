<template>
  <div class="combination-panel">
    <el-row class="combination-panel-menu">
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
    <div class="combination-panel-container">
        <combination-canvas 
            :global-scale="globalScale"
            :corpus="corpus"></combination-canvas>
    </div>
  </div>
</template>

<script>
import CombinationCanvas from './CombinationCanvas.vue'
export default {
    components: {
        'combination-canvas': CombinationCanvas,
    },
    props: {
        corpus: undefined,
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

<style lang="scss" scoped>
    @import "~sass-vars";
    .combination-panel {
        width: 100%; 
        height: 100%;
    }

    .combination-panel-menu {
        background: #dedede;
        width: 100%; 
        height: 30px;
    }

    .combination-panel-container {
        width: 100%; 
        height: calc(100% - 38px);
        overflow: auto;
    }
</style>