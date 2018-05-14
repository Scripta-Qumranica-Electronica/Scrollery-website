<template>
  <div class="attribute-search">
    <el-autocomplete
      class="attribute-input"
      v-model="attribute"
      placeholder="Enter attribute"
      :fetch-suggestions="search"
      :clearable="true"
      @select="handleSelect"
    />
    <el-button type="default" @click="onAddNew">Add New</el-button>
  </div>

</template>

<script>
export default {
  data() {
    return {
      allAttributes: [],
      attribute: '',
    }
  },
  methods: {
    /**
     * Fetch all attributes available to the current user.
     *
     * @todo this can be async or cached on the client.
     */
    loadAll() {
      return []
    },

    /**
     * Search the attributes, filtering by the query string.
     *
     * @param {string} queryString the input to search by
     * @param {function} cb        A callback to call with the results
     */
    search(queryString, cb) {
      cb(this.allAttributes)
    },

    /**
     * The user has selected an existing attribute
     *
     * @todo implement
     */
    handleSelect(item) {
      console.log(item)
    },

    /**
     * The user wants to add a new attribute based on the input.
     *
     * @todo ensure the attribute doesn't already exist
     */
    onAddNew() {
      // emit event upward
      this.$emit('new-attribute', this.attribute)

      // reset model to clear out the input
      this.attribute = ''
    },
  },
  mounted() {
    this.allAttributes = this.loadAll()
  },
}
</script>

<style lang="scss" scoped>
.attribute-input {
  width: calc(80% - 150px);
}
</style>
