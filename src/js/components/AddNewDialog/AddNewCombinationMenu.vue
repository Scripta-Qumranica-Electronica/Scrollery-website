<template>
  <div>
    <div class="hide-show-combinations" @click="show = !show">
        <i class="fa" :class="{'fa-caret-right': !show, 'fa-caret-down': show}"></i>
        <span>Combinations:</span>
        <i 
          v-show="working > 0" 
          class="fa fa-spinner fa-spin fa-fw" 
          aria-hidden="true"
          style="color: white"></i>
    </div>
    <div v-show="show">
      <el-input size="mini" class="searchBox" autosize :placeholder="$i18n.str('Enter search string')" v-model="queryString"/>
    </div>
    <ul v-show="show">
      <li @click="setCombination(-1)" >None</li>
      <li v-show="!queryString || 
                  corpus.combinations.get(combination).name
                  .toLowerCase().indexOf(queryString.toLowerCase()) !== -1"
        v-for="combination in corpus.combinations.keys()" 
        :key="'add-new-menu-combination-' + combination"
        @click="setCombination(combination)"
        :style="{background: selectedCombination === combination ? 'lightblue' : '#222f5b'}">
        {{label(combination)}}
      </li>
    </ul>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    selectedCombination: undefined,
    corpus: undefined,
  },
  data() {
    return {
      show: true,
      queryString: '',
    }
  },
  computed: {
    ...mapGetters(['working']),
  },
  methods: {
    setCombination(combination) {
      this.$emit('setCombination', combination)
    },
    label(combination) {
      return `${this.corpus.combinations.get(combination).name} (${
        this.corpus.combinations.get(combination).scroll_version_id
      })`
    },
  },
}
</script>

<style lang="scss" scoped>
ul {
  max-height: 12vh;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
