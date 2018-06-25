<template>
  <div>
    <div @click="show = !show">
        <i class="fa" :class="{'fa-caret-right': !show, 'fa-caret-down': show}"></i>
        <span>Combinations:</span>
    </div>
    <div v-show="show">
      <el-input size="mini" class="searchBox" autosize placeholder="Enter search string" v-model="queryString"/>
    </div>
    <ul v-show="show">
      <li @click="setCombination(-1)" >None</li>
      <li v-show="!queryString || 
                  corpus.combinations.get(combination).name
                  .toLowerCase().indexOf(queryString.toLowerCase()) !== -1"
        v-for="combination in corpus.combinations.keys()" 
        :key="'add-new-menu-combination-' + combination"
        @click="setCombination(combination)">
        {{label(combination)}}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    corpus: undefined,
  },
  data() {
    return {
      show: true,
      queryString: '',
    }
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
  max-height: 60%;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
