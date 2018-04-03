<template>
    <div class="text-pane" :class='{fullscreen}'>
        <div v-if="!colInRouter">
            <text-selector @selectedColumn="getText"></text-selector>
        </div>
        <toolbar :state="state" @fullscreen="toggleFullScreen" />
        <editable-text :text="text" :state="state"></editable-text>
    </div>
</template>

<script>

import KEY_CODES from './key_codes.js'
import Composition from '~/models/Composition.js'
import EditableText from './Text.vue'
import TextSelector from './TextSelector.vue'
import Toolbar from './Toolbar.vue'

import editorStore from './EditorStore.js'

export default {
    components: {
        'editable-text': EditableText,
        'text-selector': TextSelector,
        'toolbar': Toolbar
    },
    computed: {
        colInRouter() {
            return (this.$route.params.colID !== '~' && this.$route.params.colID > 0)
        }
    },
    data() {
        return {

            /**
             * @type {boolean} true for fullscreen mode; false for in-line
             */
            fullscreen: false,

            /**
             * @type {Composition} A text model for display in the editor (can have multiple cols)
             */
            text: new Composition(),

            /**
             * @type {string} the hidden input value
             */
            input: '',

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
                colId: colID
            })
            .then(res => {
                if (res.status === 200 && res.data) {
                    this.text = Composition.fromSigns({
                        id: scrollVersionID
                    }, res.data.results)
                } else {
                    throw new Error("Unable to retrieve text data")
                }
            })
            .catch(err => {
                // TODO: handle err
                console.error(err);
            })
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

.text-pane {
    overflow: scroll;
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

</style>
