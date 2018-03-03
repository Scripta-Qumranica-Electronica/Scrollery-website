<template>
  <div class="text-pane">
    <div v-if="!colInRouter">
      <text-selector @selectedColumn="getText"></text-selector>
    </div>
    <div class="text-div">
      <div v-for="(column, colIDX) of currentText.cols" 
            :data-col="column.col" 
            :key="colIDX + column.col">
        <div v-for="(line, lineIDX) of column.lines" 
                :key="lineIDX + line.lineId"
                :data-line="line.line" 
                :data-line-id="line.lineId"
                dir="rtl">
          <span class="stop"></span>
          <span>{{column.col}}:{{line.line}}</span>
          <span class="stop">&nbsp;</span>
          <span 
            v-for="(sign, signIDX) of line.signs"
            class="sign"
            :class="{ 
                complete: !sign.is_reconstructed,
                reconstructed: sign.is_reconstructed, 
                incomplete_clear: sign.readability === 'INCOMPLETE_BUT_CLEAR',
                incomplete_not_clear: sign.readability === 'INCOMPLETE_AND_NOT_CLEAR', 
                }"
            :key="signIDX + sign"
            :data-id="sign.id"
            :data-prev-sign="sign.prev_sign"
            :data-next-sign="sign.next_sign">
            {{sign.sign}}{{sign.readability === 'INCOMPLETE_AND_NOT_CLEAR' ? '֯' : ''}}{{sign.readability === 'INCOMPLETE_BUT_CLEAR' ? 'ׄ' : ''}}
          </span>
          <span class="stop"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SignStreamProcessor from '../utils/SignStreamProcessor.js'
import TextSelector from './TextSelector.vue'

export default {
    components: {
        'text-selector': TextSelector,
    },
    data() {
        return {
            currentText: [],
            ssp: new SignStreamProcessor(),
            colInRouter: false,
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
                    this.ssp.streamToTree(
                        res.data.results, 
                        'prev_sign_id',
                        'sign_id',
                        'next_sign_id'
                    )
                    .then( formattedNodes => {
                        this.currentText = formattedNodes
                    })
                }
            })
        }
    },
    watch: {
        '$route' (to, from) {
            if (to.params.colID !== from.params.colID) {
                if (to.params.colID !== '~' && to.params.colID > -1) {
                    this.colInRouter = true
                    this.getText(to.params.scrollVersionID, to.params.colID)
                } else {
                    this.colInRouter = false
                    this.currentText = []
                }
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.text-div {
    overflow: auto;
    height: calc(100% - 50px);
}
span {
  display: inline-block;
}

span.sign.reconstructed {
  color: #fff;
  text-shadow: 1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000, -1px 0 0 #000;
  margin-left: 1px;
  margin-right: 1px;
}

:before {
    margin-left: -5px;
}

.complete+.reconstructed:before {
    content: '[';
    color: black;
    text-shadow: initial;
}

.stop+.reconstructed:before {
    content: '[';
    color: black;
    text-shadow: initial;
}

.reconstructed+.complete:before {
    content: ']';
    color: black;
    text-shadow: initial;
}

.reconstructed+.stop:before {
    content: ']';
    color: black;
    text-shadow: initial;
}

span.sign.incomplete_clear {
    color: yellow;
}

span.sign.incomplete_not_clear {
    color: red;
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
