<template>
  <div :style="{background: $route.params.colID === column.col_id ? 'lightblue' : '#dedede'}">
    <span class="clickable-menu-item" @click="setRouter">
      <span v-show="!nameInput">{{column.name}} ({{column.col_id}})</span>
      <el-input 
        class="col-name-change"
        v-show="nameInput" 
        placeholder="Label" 
        v-model="nameInput"
        size="mini"
        @blur="setName"
        @keyup.enter.native="setName"></el-input>
      <i v-if="!corpus.combinations.get(scrollVersionID).locked" class="fa fa-edit" @click="startNameChange"></i>
      <i v-if="!corpus.combinations.get(scrollVersionID).locked" class="fa fa-trash-o" @click="deleteColumn"></i>
    </span>
  </div>
</template>

<script>
export default {
  props: {
    scrollVersionID: undefined,
    scrollID: undefined,
    column: {},
    corpus: {},
  },
  data() {
    return {
      nameInput: undefined,
    }
  },
  methods: {
    /*
     * We still ned to implement a search to find all
     * artefacts belonging to a column.
     */
    setRouter() {
      const params = this.$route.params
      if (
        params.scrollID !== this.scrollID ||
        params.scrollVersionID !== this.scrollVersionID ||
        params.colID !== this.column.col_id
      ) {
        this.$router.push({
          name: 'workbenchAddress',
          params: {
            scrollID: this.scrollID,
            scrollVersionID: this.scrollVersionID,
            colID: this.column.col_id,
            imageID: params.imageID,
            artID: params.artID,
          },
        })
      }
    },
    startNameChange() {
      this.nameInput = this.column.name
    },
    setName() {
      if (this.nameInput) {
        this.$store.commit('addWorking')
        this.corpus.cols
          .updateName(this.column.col_id, this.nameInput, this.scrollVersionID)
          .then(res => {
            /* istanbul ignore next */
            this.$store.commit('delWorking')
            /* istanbul ignore next */
            this.nameInput = undefined
          })
          .catch(err => {
            /* istanbul ignore next */
            this.$store.commit('delWorking')
            /* istanbul ignore next */
            console.error(err)
          })
      }
    },
    deleteColumn() {
      this.$store.commit('addWorking')
      this.corpus.cols
        .removeItem(this.column.col_id, this.scrollVersionID)
        .then(res => {
          /* istanbul ignore next */
          this.$store.commit('delWorking')
          /* istanbul ignore next */
          this.$router.push({
            name: 'workbenchAddress',
            params: {
              scrollID: this.scrollID,
              scrollVersionID: this.scrollVersionID,
              colID: '~',
              imageID: this.$route.params.imageID,
              artID: this.$route.params.artID,
            },
          })
        })
        .catch(err => {
          /* istanbul ignore next */
          this.$store.commit('delWorking')
          /* istanbul ignore next */
          console.error(err)
        })
    },
  },
}
</script>

<style lang="scss" scoped>
.col-name-change {
  width: 100px;
}
</style>
