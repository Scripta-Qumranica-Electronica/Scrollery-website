<template>
  <div class="text-pane">
    <!-- <div show.bind="sharedState.editingState === 1">
      <select class="main-menu-select-container" mdc-select-css value.bind="selectedCombinationId" change.delegate="selectCombination($event)">
        <option
          repeat.for="combination of combinations"
          model.bind="combination">${combination.name}</option>
      </select>
      <select class="main-menu-select-container" mdc-select-css value.bind="selectedColId">
        <option
          repeat.for="col of cols"
          model.bind="col.id">${col.name}</option>
      </select>
    </div> -->
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
          <span v-for="(sign, signIDX) of line.signs"
                :key="signIDX + sign"
                :data-id="sign.id"
                :data-prev-sign="sign.prev_sign"
                :data-next-sign="sign.next_sign">
            {{sign.sign}}
          </span>
          <span class="stop"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SignStreamProcessor from '../utils/SignStreamProcessor.js'

export default {
    data() {
        return {
            currentText: [],
            ssp: new SignStreamProcessor(),
        }
    },
    watch: {
        '$route' (to, from) {
            if (to.params.selectionType === 'col' && to.params.id !== from.params.id) {
                this.$post('resources/cgi-bin/GetImageData.pl', {
                transaction: 'getSignStreamOfColumn',
                SCROLL_VERSION: to.params.scrollVersionID,
                colId: to.params.id,
                SESSION_ID: this.$store.getters.sessionID
            })
            .then(res => {
                if (res.status === 200 && res.data) {
                    this.ssp.streamToTree(res.data.results, 
                                                        'prev_sign_id',
                                                        'sign_id',
                                                        'next_sign_id')
                    .then( formattedNodes => {
                        this.currentText = formattedNodes
                    })
                }
            })
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

span.sign.reconstructed-1 {
  color: #fff;
  text-shadow: 1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000, -1px 0 0 #000;
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
