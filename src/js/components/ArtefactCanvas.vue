<template>
  <div 
    ref="artefactOverlay"
    class="artefactOverlay"
    :width="width"
    :height="height"
    :style="{transform: `scale(${scale})`}">
    <canvas
      class="maskCanvas"
      :class="{pulse: !drawing}"
      ref="maskCanvas"
      :width="width"
      :height="height"
      @mousemove="trackMouse($event)"
      @mouseenter="mouseOver = true"
      @mouseleave="mouseOver = false"
      @mousedown="processMouseDown"
      @mouseup="processMouseUp">
    </canvas>
    <div 
      class="cursor" 
      v-show="mouseOver"
      :style="{
        top: `-${brushSize / 2 / scale}px`, 
        left: `-${brushSize / 2 / scale}px`,
        transform: `translate3d(${cursorPos.x / scale}px,${cursorPos.y / scale}px,0px)`
      }">
      
      <svg 
        :width="brushSize / scale" 
        :height="brushSize / scale">
        <circle 
          class="cursor-img" 
          :cx="brushSize / scale / 2"
          :cy="brushSize / scale / 2"
          :r="brushSize / scale / 2"
          stroke="black"
          stroke-width="1"
          fill="blue">
        </circle>
      </svg>
    </div>
  </div>
</template>

<script>
import {trace} from '../utils/Potrace.js'
import {clipCanvas} from '../utils/VectorFactory'

export default {
  props: {
    mask: "",
    width: 0,
    height: 0,
    divisor: 0,
    scale: 0,
    drawMode: '',
    brushSize: 0,
  },
  data() {
    return {
      cursorPos: {
        x: 10,
        y: 10,
      },
      mouseOver: false,
      drawing: false,
    }
  },
  methods: {
    trackMouse(event) {
      this.cursorPos = this.mousePositionInElement(event, event.target)
      if (this.drawing) {
        this.drawOnCanvas()
      }
    },
    processMouseDown() {
      this.drawing = true
      this.drawOnCanvas()
    },
    processMouseUp() {
      this.drawing = false
      this.canvasToSVG()
    },
    drawOnCanvas() {
      const ctx = this.$refs.maskCanvas.getContext('2d')
      ctx.beginPath()
      ctx.arc(this.cursorPos.x / this.scale, this.cursorPos.y / this.scale, this.brushSize / 2 / this.scale, 0, 2 * Math.PI)
      ctx.closePath()
      if(this.drawMode === 'erase'){
        ctx.globalCompositeOperation='destination-out'
        ctx.fill()
      } else {
        ctx.globalCompositeOperation='source-over'
        ctx.fillStyle = 'purple'
        ctx.fill()
      }
    },
    mousePositionInElement(event, element) {
      const initOffset = element.getBoundingClientRect()
      let returnPos = {
        x: event.clientX - initOffset.left + element.scrollLeft,
        y: event.clientY - initOffset.top + element.scrollTop,
      }
      return returnPos
    },
    canvasToSVG(){
      trace(this.$refs.maskCanvas, this.divisor).then(res=>{
        this.$emit('mask', res)
      })
    }
  },
  watch: {
    mask (to, from) {
      if (to && from !== to) {

        clipCanvas(this.$refs.maskCanvas, this.mask, this.divisor)
      }
    }
  },
}
</script>

<style lang="scss" scoped>
  .artefactOverlay {
    cursor: none;
  }
  .maskCanvas {
      opacity: 0.3;
  }
  .maskCanvas.pulse {
    opacity: 0.3;
    animation: pulsate 3s ease-out;
    animation-iteration-count: infinite;
  }

  @keyframes pulsate {
    0%    { opacity:0;}
    50%   { opacity:0.3;}
    100%  { opacity:0;}
  }
  .cursor {
    position: absolute;
    opacity: 0.3;
    pointer-events: none;
  }
</style>

