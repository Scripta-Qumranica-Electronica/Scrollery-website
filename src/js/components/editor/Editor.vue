<template>
    <div class="text-pane" :class='{fullscreen}'>
        <toolbar :state="state"
            @fullscreen="toggleFullScreen"
        />
        <div v-if="!colInRouter">
            <text-selector @selectedColumn="getText"></text-selector>
        </div>
        <section class="editor">
            <div class="editor-column" v-for="(column, columnIndex) of currentText.cols" :data-col="column.col" :key="columnIndex + column.col">
                <input id="editor-input" class="" @keyup="onKeyup" @blur="onInputBlur" v-model="input" />
                <table class="editor-table" >
                    <thead>
                        <th>{{column.col}}</th>
                        <th class="line-col"></th>
                    </thead>
                    <tbody>
                        <tr v-for="(line, lineIDX) of column.lines" :key="lineIDX + line.lineId" :data-line="line.line" :data-line-id="line.lineId"
                            dir="rtl">
                            <td class="text-col">
                                <sqe-sign v-for="sign of line.signs"
                                    @click="onClick"
                                    :sign="sign"
                                    :state="state" 
                                    :focusedSignId="focusedSignId"
                                    :key="sign.id"
                                />
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

import KEY_CODES from './key_codes.js';
import TextSelector from './TextSelector.vue'
import Toolbar from './Toolbar.vue'
import SignStreamProcessor from '~/utils/SignStreamProcessor.js'
import Sign from './Sign.vue';
import editorStore from './EditorStore.js'

export default {
    components: {
        'sqe-sign': Sign,
        'text-selector': TextSelector,
        'toolbar': Toolbar
    },
    computed: {

        /**
         * @type {string} the sign id for the currently focused sign 
         */
        focusedSignId() {
            return this.focusedSign ? this.focusedSign.id : -1
        },

        colInRouter() {
            return (this.$route.params.colID !== '~' && this.$route.params.colID > 0)
        }
    },
    data() {
        return {

            /**
             * @type {array}
             */
            currentText: [],

            /**
             * @type {boolean} true for fullscreen mode; false for in-line
             */
            fullscreen: false,

            /**
             * @type {SignStreamProcessor} Class that can process an array of sign
             */
            ssp: new SignStreamProcessor(),

            /**
             * @type {string} the hidden input value
             */
            input: '',

            /**
             * @type {Sign}  The sign instance currently in focus
             */
            focusedSign: null,

            /**
             * @type {Store} A Vuex store for the editor component tree
             */
            state: editorStore(this.$i18n)
        }
    },
    methods: {

        /**
         * Asynchronously retrieve the text from the server
         * 
         * @param {string} scrollVersionID The scroll ID
         * @param {string} colID           The Column ID
         */
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
            .then(formattedNodes => {
                this.currentText = formattedNodes
            })
            .catch(err => {
                // TODO: handle err
                console.error(err);
            })
        },

        /**
         * When the editor is clicked on, we set focus on the hidden editor input
         * 
         * @param {Sign} sign The sign clicked on
         */
        onClick(sign) {
            this.focusedSign = sign
            document.getElementById('editor-input').focus()
        },

        /**
         * @param {FocusEvent} event  The keyboard event received from the input
         */
         onInputBlur(event) {
            this.focusedSign = null;
        },

        /**
         * @param {KeyboardEvent} event  The keyboard event received from the input
         */
        onKeyup(event) {

            // Hand-off all Ctrl-key events to another method
            if (event.ctrlKey) {
                this.onCtrlKeyEvent(event)
                return;
            }

            switch (event.code) {

                // next sign
                case KEY_CODES.ARROWS.LEFT:
                    if (this.focusedSign && this.focusedSign.hasNext()) {
                        this.focusedSign = this.focusedSign.next();
                    }
                    break;

                // previous sign
                case KEY_CODES.ARROWS.RIGHT:
                    if (this.focusedSign && this.focusedSign.hasPrevious()) {
                        this.focusedSign = this.focusedSign.previous();
                    }
                    break
                
                // down arrow
                case KEY_CODES.ARROWS.DOWN:
                    break;

                // up arrow
                case KEY_CODES.ARROWS.UP:
                    break;
                
                // default: handle any other change
                default:

                    // there's text entered in the field
                    if (this.input && this.input.length) {
                        this.focusedSign
                    }

                    break;
            }

            // handled the input, reset it
            this.input = ''
        },

        /**
         * Handle the user's ctrl + Key event
         * 
         * @param {KeyboardEvent} event  The keyboard event received from the input
         */
        onCtrlKeyEvent(event) {

        },

        /**
         * Show the editor in full screen mode
         */
        toggleFullScreen() {
            this.fullscreen = !this.fullscreen;
        }
    },
    mounted() {

        // check to see if there's a columnID in the route
        // if so, attempt to load up the text straightaway
        const colID = this.$route.params.colID
        if (colID !== '~' && colID > 0) {
            this.getText(this.$route.params.scrollVersionID, colID)
        }
    },
    watch: {
        '$route' (to, from) {
            if (to.params.colID !== from.params.colID) {
                if (to.params.colID !== '~' && to.params.colID > 0) {
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
    background-color: #fff;
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

.editor {
    position: relative;
    overflow: scroll;
    background-color: rgba($ltOrange, 0.1);
    width: 100%;
    height: 100%;
}

.editor-table {
    width: 100%;
    border-collapse: collapse;
    background-color: rgba($ltOrange, 0.1);

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

#editor-input {
    position: absolute;
        top: 0;
        left: 0;
    z-index: -1;
}

</style>
