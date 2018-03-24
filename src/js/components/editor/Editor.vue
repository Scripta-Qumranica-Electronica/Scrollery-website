<template>
    <div class="text-pane" :class='{fullscreen}'>
        <toolbar :state="state"
            @fullscreen="toggleFullScreen"
        />
        <div v-if="!colInRouter">
            <text-selector @selectedColumn="getText"></text-selector>
        </div>
        <section class="text-div">
            <div class="editor-column" v-for="(column, columnIndex) of currentText.cols" :data-col="column.col" :key="columnIndex + column.col">
                <table class="editor-table" >
                    <thead>
                        <th>{{column.col}}</th>
                        <th class="line-col"></th>
                    </thead>
                    <tbody>
                        <tr v-for="(line, lineIDX) of column.lines" :key="lineIDX + line.lineId" :data-line="line.line" :data-line-id="line.lineId"
                            dir="rtl">
                            <td class="text-col">
                                <sqe-sign v-for="sign of line.signs" :sign="sign" :state="state" :key="sign.id"></sqe-sign>
                            </td>
                            <td class="line-col">{{line.line}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</template>

<script>
import TextSelector from './TextSelector.vue'
import Toolbar from './Toolbar.vue'
import SignStreamProcessor from '~/utils/SignStreamProcessor.js'
import Sign from './Sign.vue';
import { Store } from 'vuex'

export default {
    components: {
        'sqe-sign': Sign,
        'text-selector': TextSelector,
        'toolbar': Toolbar
    },
    computed: {
        colInRouter() {
            return (this.$route.params.colID !== '~' && this.$route.params.colID > -1)
        }
    },
    data() {
        return {
            currentText: [],

            fullscreen: false,

            ssp: new SignStreamProcessor(),

            // TODO: move to own file
            state: new Store({
                state: {
                    showReconstructedText: true
                },
                getters: {
                    showReconstructedText: state => state.showReconstructedText
                },
                mutations: {
                    showReconstructedText(state) {
                        state.showReconstructedText = true;
                    },
                    hideReconstructedText(state) {
                        state.showReconstructedText = false;
                    }
                }
            })
        }
    },
    methods: {
        getText(scrollVersionID, colID) {
            this.$post('resources/cgi-bin/scrollery-cgi.pl', {
                transaction: 'getSignStreamOfColumn',
                SCROLL_VERSION: scrollVersionID,
                colId: colID,
                SESSION_ID: this.$store.getters.sessionID
            })
            .then(res => {
                if (res.status === 200 && res.data) {
                    return this.ssp.streamToTree(
                        res.data.results, 
                        'prev_sign_id',
                        'sign_id',
                        'next_sign_id'
                    )
                } else {
                    throw new Error("Unable to retrieve text data")
                }
            })
            .then( formattedNodes => {
                this.currentText = formattedNodes
            })
            .catch(err => {
                // handle err
                console.error(err);
            })
        },
        toggleFullScreen() {
            this.fullscreen = !this.fullscreen;
        }
    },
    mounted() {
        const colID = this.$route.params.colID
        if (colID !== '~' && colID > -1) {
            this.getText(this.$route.params.scrollVersionID, colID)
        }
    },
    watch: {
        '$route' (to, from) {
            if (to.params.colID !== from.params.colID) {
                if (to.params.colID !== '~' && to.params.colID > -1) {
                    this.getText(to.params.scrollVersionID, to.params.colID)
                } else {
                    this.currentText = []
                }
            }
        }
    }
}
</script>

<style lang="scss" scoped>

$dkTan: #cd853f;
$ltOrange: #f4a460;

.text-pane {
    overflow: hidden;
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    transition: all 300ms;
}

.text-pane.fullscreen {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    z-index: 2000;
    background: #fff;
}

.text-div {
    overflow: scroll;
    background-color: rgba($ltOrange, 0.1);
    width: 100%;
    height: 100%;
}

.editor-table {
    width: 100%;
    border-collapse: collapse;

    & th {
        background-color: rgba($dkTan, 0.4);
    }

    & td {
        font-size: 1.1em;
        padding: 6px;
        vertical-align: text-top;

        &.line-col {
            padding-left: 6px;
            background-color: rgba($dkTan, 0.4);
            font-size: .7em;
            text-align: left;
        }
    }

    & tr:hover {
        & td {
            background-color: rgba($ltOrange, 0.1);
            
            &.line-col {
                background-color: rgba($dkTan, 0.5);
            }
        }
    }
}

@keyframes blink {
  from , to {border-color:black}
  50%{border-color:transparent}
}

.edit-next {
  margin-right: -1px;
  border-right: 1px solid black;
  animation: 1s blink step-end infinite;
}
</style>
