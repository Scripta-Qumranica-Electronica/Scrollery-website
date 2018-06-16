<template>
  <div class="attribute-search">
    <el-autocomplete
      class="attribute-input"
      v-model="attribute"
      placeholder="seach attributes"
      value-key="name"
      :fetch-suggestions="search"
      :clearable="true"
      @select="handleSelect"
    />
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
     * Search the attributes, filtering by the query string.
     *
     * @param {string} queryString the input to search by
     * @param {function} cb        A callback to call with the results
     */
    search(queryString, cb) {
      const re = new RegExp(queryString, 'i')
      cb(this.allAttributes.filter(({ name }) => re.test(name)))
    },

    /**
     * The user has selected an existing attribute
     *
     * @todo implement
     */
    handleSelect({ name }) {
      const attribute = this.$store.getters.attributes[name]

      this.$emit('add-attribute', attribute)
    },
  },
  mounted() {
    const list = []
    for (let name in this.$store.getters.attributes) {
      list.push({ name })
    }

    this.allAttributes = list
  },
}
</script>

<style lang="scss" scoped>
.attribute-input {
  width: calc(80% - 150px);
}
</style>
