<template>
  <div>
      <el-select 
        filterable
        v-model="selectedCombination"
        v-on:change="selectCombination"
        placeholder="Select Combination">
          <el-option 
            v-for="combination in combinations"
            :key="combination.version_id"
            :label="combination.user_id > 0 ? `${combination.name} - ${combination.version}` : `${combination.name}`"
            :value="combination"></el-option>
      </el-select>
      <el-select 
        filterable
        v-if="selectedCombination"
        v-model="selectedColumnID"
        v-on:change="selectColumn"
        placeholder="Select Column">
          <el-option 
            v-for="column in columns"
            :key="`selector-${column.id}`"
            :value="column.id">{{column.name}}</el-option>
      </el-select>
  </div>
</template>

<script>
export default {
  data() {
    return {
      combinations: [],
      columns: [],
      selectedCombination: undefined,
      selectedColumnID: undefined,
    }
  },
  methods: {
    selectCombination() {
      this.$post('resources/cgi-bin/scrollery-cgi.pl', {
        transaction: 'getColOfComb',
        version_id: this.selectedCombination.version_id,
        combID: this.selectedCombination.scroll_id,
        USER_NAME: this.$store.getters.username,
        PASSWORD: this.$store.getters.password,
      }).then(res => {
        this.columns = res.data.results
      })
    },
    methods: {
      selectCombination() {
        this.$post('resources/cgi-bin/scrollery-cgi.pl', {
          transaction: 'getColOfComb',
          version_id: this.selectedCombination.version_id,
          combID: this.selectedCombination.scroll_id,
          SESSION_ID: this.$store.getters.sessionID,
        }).then(res => {
          this.columns = res.data.results
        })
      },
      selectColumn() {
        this.$emit('selectedColumn', this.selectedCombination.version_id, this.selectedColumnID)
      },
      getText(scrollVersionID, colID) {
        this.$post('resources/cgi-bin/scrollery-cgi.pl', {
          transaction: 'getSignStreamOfColumn',
          SCROLL_VERSION: scrollVersionID,
          colId: colID,
          SESSION_ID: this.$store.getters.sessionID,
        }).then(res => {
          if (res.status === 200 && res.data) {
            this.ssp
              .streamToTree(res.data.results, 'prev_sign_id', 'sign_id', 'next_sign_id')
              .then(formattedNodes => {
                this.currentText = formattedNodes
              })
          }
        })
      },
    },
  },
}
</script>

<style lang="scss" scoped>
</style>
