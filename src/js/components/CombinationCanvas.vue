<template>
    <div :style="dimensions">
        <svg
            v-if="corpus.combinations.get(scrollVersionID)" 
            class="combination-canvas"
            :viewBox="viewBox"
            @mousemove="mousemove"
            @mousedown="mousedown"
            ref="svgCanvas">
            <artefact v-for="artefact of corpus.combinations.get(scrollVersionID).artefacts"
                v-if="corpus.combinations.get(scrollVersionID) && corpus.artefacts.get(artefact)"
                :key="'combination-art-' + artefact" 
                :artefact="corpus.artefacts.get(artefact)"
                :base-d-p-i="baseDPI"
                :images="corpus.imageReferences.get(corpus.artefacts.get(artefact).image_catalog_id).images"
                :corpus="corpus"
                ></artefact>
        </svg>
    </div>
</template>

<script>
    import {
        wktPolygonToSvg,
        wktPointToSvg,
        wktParseRect,
        dbMatrixToSVG,
        svgMatrixToDB
    } from '~/utils/VectorFactory'
    import Artefact from './Artefact.vue'
    // I will use the rematrix package to directly apply
    // rotation to existing artefact matrices.
    import * as Rematrix from 'rematrix'
    export default {
        props: {
            globalScale: {
                type: Number,
                default: 1.0,
            },
            corpus: {
                type: Object,
            }
        },
        components: {
            'artefact': Artefact
        },
        data() {
            return {
                scrollWidth: 10000,
                scrollHeight: 1500,
                artefacts: [],
                baseDPI: 1215,
                clickOrigin: undefined,
                selectedArtefactIndex: undefined,
                selectedArtefactLoc: undefined,
                scrollVersionID: undefined,
            }
        },
        computed: {
            canvasWidth() {
                return `${this.scrollWidth * this.globalScale}`
            },
            canvasHeight() {
                return `${this.scrollHeight * this.globalScale}`
            },
            viewBox() {
                return `0 0 ${this.scrollWidth} ${this.scrollHeight}`
            },
            dimensions() {
                return `width: ${this.canvasWidth}px; height: ${this.canvasHeight}px;`
            },
            svgCanvas() {
                return this.$refs['svgCanvas']
            },
        },
        methods: {
            setScrollDimensions(scrollID, versionID) {
                this.$post('resources/cgi-bin/scrollery-cgi.pl', {
                        transaction: 'getScrollWidth',
                        scroll_id: scrollID,
                        scroll_version_id: versionID,
                    })
                    .then(res => {
                        if (res.status === 200 && res.data.results) {
                            this.scrollWidth = res.data.results[0].max_x
                        }
                    })
                this.$post('resources/cgi-bin/scrollery-cgi.pl', {
                        transaction: 'getScrollHeight',
                        scroll_id: scrollID,
                        scroll_version_id: versionID,
                    })
                    .then(res => {
                        if (res.status === 200 && res.data.results) {
                            this.scrollHeight = res.data.results[0].max_y
                        }
                    })
            },
            mousedown(event) {
                if (event.target.nodeName === 'image') {
                    this.selectedArtefactIndex = event.target.dataset.index
                    this.selectedArtefactLoc = this.artefacts[this.selectedArtefactIndex].matrix
                    this.clickOrigin = this.pointInSvg(event.clientX, event.clientY)
                    window.addEventListener('mouseup', this.mouseup); // Attach listener to window.
                }
            },
            mousemove(event) {
                if (this.clickOrigin && this.selectedArtefactIndex) {
                    const currentLoc = this.pointInSvg(event.clientX, event.clientY)
                    this.artefacts[this.selectedArtefactIndex].matrix = [
                        this.selectedArtefactLoc[0],
                        this.selectedArtefactLoc[1],
                        this.selectedArtefactLoc[2],
                        this.selectedArtefactLoc[3],
                        this.selectedArtefactLoc[4] + currentLoc.x - this.clickOrigin.x,
                        this.selectedArtefactLoc[5] + currentLoc.y - this.clickOrigin.y
                    ]
                }
            },
            mouseup(event) {
                if (this.clickOrigin && this.selectedArtefactIndex) {
                    this.clickOrigin = this.selectedArtefactLoc = undefined
                    window.removeEventListener('mouseup', this.mouseup);
                    this.$post('resources/cgi-bin/scrollery-cgi.pl', {
                            transaction: 'setArtPosition',
                            art_id: this.artefacts[this.selectedArtefactIndex].id,
                            matrix: svgMatrixToDB(this.artefacts[this.selectedArtefactIndex].matrix),
                            version_id: this.$route.params.scrollVersionID,
                        })
                        .then(res => {
                            if (res.status === 200 && res.data.returned_info) {
                                this.artefacts[this.selectedArtefactIndex].id = res.data.returned_info
                                this.selectedArtefactIndex = undefined
                            }
                        })
                }
            },
            pointInSvg(x, y) {
                const pt = this.svgCanvas.createSVGPoint();
                pt.x = x;
                pt.y = y;
                return pt.matrixTransform(this.svgCanvas.getScreenCTM().inverse());
            },
        },
        watch: {
            '$route' (to, from) {
                if (to.params.scrollVersionID !== '~' && to.params.scrollID !== '~'
                    && (to.params.scrollVersionID !== from.params.scrollVersionID 
                    || to.params.scrollID !== from.params.scrollID)) {
                    this.scrollVersionID = to.params.scrollVersionID >>> 0
                    this.setScrollDimensions(to.params.scrollID, to.params.scrollVersionID)
                    this.corpus.populateImageReferencesOfCombination(to.params.scrollVersionID)
                    .then(res => {
                        this.corpus.combinations.get(this.scrollVersionID).imageReferences.forEach(reference => {
                            this.corpus.populateImagesOfImageReference(reference, this.scrollVersionID)
                            .then(res1 => {
                                this.corpus.populateArtefactsOfImageReference(reference, this.scrollVersionID)
                            })
                        })
                    })
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    .combination-canvas {
        max-height: initial;
    }
</style>