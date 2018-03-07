<template>
    <svg    ref="roiSvg"
            :width="width / divisor"
            :height="height / divisor"
            :viewbox="'0 0 ' + width / divisor + ' ' + height / divisor" 
            @mousemove="moveROI($event)" 
            @mousedown="newROI($event)"
            @mouseup="deselectROI()"
            :transform="'scale(' + zoomLevel + ')'"
            >
    <!-- <defs>
      <path id="Clip-path" d="${poly}" transform="scale(${scale})"></path>
    </defs>
    <defs>
      <clipPath id="Clipping-outline">
        <use stroke="none" fill="black" fill-rule="evenodd" xlink:href="#Clip-path"></use>
      </clipPath>
    </defs>
    <g clip-path="url(#Clipping-outline)" pointer-events="visiblePainted" style="opacity: 1;">
      <image class="clippedImg" draggable="false" xlink:href="${image}" width="${width}" height="${height}"></image>
    </g> -->
    <!-- <g clip-path="url(#Clipping-outline)" pointer-events="visiblePainted" style="opacity: 1;">
      <image class="clippedImg" draggable="false" xlink:href="${image}" width="${width}" height="${height}"></image>
    </g> -->
    <g pointer-events="none">
      <image v-for="image of images" 
            :key="'svg-image-' + image.filename"
            class="clippedImg" 
            draggable="false" 
            :xlink:href="image.url + image.filename + '/full/pct:' + 100 / divisor + '/0/' + image.suffix"
            :width="width / divisor"
            :height="height / divisor"
            :opacity="image.opacity"
            :visibility="image.visible ? 'visible' : 'hidden'"></image>
    </g>
    <g v-for="box of boxes">
      <rect :x="box.x * zoom" 
            :y="box.y * zoom" 
            :width="box.width * zoom"
            :height="box.height * zoom" 
            stroke="blue" 
            :fill="box.color"
            fill-opacity="0.2"
            stroke-opacity="0.8" 
            @mousedown="selectROI($event, box, 'drag')"/>

      <circle class="clipped-img-control-circle"
              :cx="box.x * zoom"
              :cy="box.y * zoom" 
              r="3"
              stroke="yellow" 
              fill="green"
              fill-opacity="0.5"
              stroke-opacity="0.8" 
              @mousedown="selectROI($event, box, 'resizeXY')"/>

      <circle class="clipped-img-control-circle"
              :cx="box.x * zoom"
              :cy="(box.y + box.height) * zoom" 
              r="3" stroke="yellow"
              fill="green" 
              fill-opacity="0.5" 
              stroke-opacity="0.8" 
              @mousedown="selectROI($event, box, 'resizeXH')"/>

      <circle class="clipped-img-control-circle"
              :cx="(box.x + box.width) * zoom"
              :cy="box.y * scale" 
              r="3" stroke="yellow"
              fill="green"
              fill-opacity="0.5" 
              stroke-opacity="0.8" 
              @mousedown="selectROI($event, box, 'resizeWY')"/>

      <circle class="clipped-img-control-circle"
              :cx="(box.x + box.width) * scale"
              :cy="(box.y + box.height) * scale" 
              r="3" stroke="yellow"
              fill="green" 
              fill-opacity="0.5" 
              stroke-opacity="0.8" 
              mousedown.delegate="selectROI($event, box, 'resizeWH')"/>
    </g>
  </svg>
</template>

<script>
export default {
    props: {
        width: Number,
        height: Number,
        zoomLevel: '',
        images: {
            type: Array,
            default: [],
        }
    },
    data() {
        return {
            boxes: [],
            selectedBox: undefined,
            mouseMoveType: undefined,
            oldMousePos: undefined,
            zoom: '1.0',
            scale: 1.0,
            divisor: 2,
            click: false,
        }
    },
    components: {
    },
    computed: {
    },
    methods: {
        newROI(event) {
            if (event.target.nodeName === 'svg') {
            const point = this.pointInSvg(event.clientX, event.clientY);
            const box = { x: point.x / this.scale,
                y: point.y / this.scale,
                width: 10,
                height: 10,
                color: 'purple'};
            this.boxes.push(box);
            this.selectROI(event, box, 'resizeWH');
            }
        },

        selectROI(event, box, type) {
            if (this.selectedBox) {
            this.selectedBox.color = 'purple';
            }
            this.selectedBox = box;
            this.selectedBox.color = 'orange';
            this.oldMousePos = {x: event.clientX,
            y: event.clientY};
            this.mouseMoveType = type;
            this.click = true;
            window.setTimeout(() => this.click = false, 200);
        },

        deselectROI() {
            this.mouseMoveType = undefined;
            this.oldMousePos = undefined;
        },

        moveROI(event) {
            if (this.mouseMoveType) {
                const move = {x: (event.clientX - this.oldMousePos.x) / this.scale,
                    y: (event.clientY - this.oldMousePos.y) / this.scale};
                this.oldMousePos = {x: event.clientX,
                    y: event.clientY};
                if (this.mouseMoveType === 'drag') {
                    this.selectedBox.x += move.x;
                    this.selectedBox.y += move.y;
                } else if (this.mouseMoveType === 'resizeXY') {
                    this.selectedBox.x += move.x;
                    this.selectedBox.y += move.y;
                    this.selectedBox.width -= move.x;
                    this.selectedBox.height -= move.y;
                } else if (this.mouseMoveType === 'resizeWY') {
                    this.selectedBox.y += move.y;
                    this.selectedBox.width += move.x;
                    this.selectedBox.height -= move.y;
                } else if (this.mouseMoveType === 'resizeWH') {
                    this.selectedBox.width += move.x;
                    this.selectedBox.height += move.y;
                } else if (this.mouseMoveType === 'resizeXH') {
                    this.selectedBox.x += move.x;
                    this.selectedBox.width -= move.x;
                    this.selectedBox.height += move.y;
                }
            }
        },

        deleteSelectedRoi() {
            if (this.selectedBox) {
            const idx = this.boxes.indexOf(this.selectedBox);
                if (idx !== -1) {
                    this.boxes.splice(idx, 1);
                }
            }
        },

        pointInSvg(x, y) {
            const pt = this.$refs.roiSvg.createSVGPoint();
            pt.x = x;
            pt.y = y;
            return pt.matrixTransform(this.$refs.roiSvg.getScreenCTM().inverse());
        },
    },
}
</script>

<style lang="scss" scoped>
svg {
    max-height: initial;
}
</style>
