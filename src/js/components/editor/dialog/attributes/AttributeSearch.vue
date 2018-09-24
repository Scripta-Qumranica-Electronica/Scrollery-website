<template>
  <div class="attribute-search">
    <el-autocomplete
    <!--  class="attribute-input"-->
    <el-autocomplete
      class="attribute-input"
      v-model="attribute"
      value-key="name"
      :fetch-suggestions="querySearch"
      :clearable="true"
      placeholder="seach attributes"
      @select="handleSelect"
    />
  </div>

</template>

<script>
export default {
  props: {
    corpus: undefined,
    sign_id: undefined,
  },
  data() {
    return {
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
      cb(['one', 'two', 'three'])
      // cb(this.corpus.signCharAttributeList._items.filter(({ k }) => re.test(k.attribute_value_name)))
    },

    querySearch(queryString, cb) {
      var links = []
      for (const key in this.corpus.signCharAttributeList._items) {
        links.push({
          key: key,
          name: this.corpus.signCharAttributeList.get(key).attribute_value_name,
        })
      }
      var results = queryString ? links.filter(this.createFilter(queryString)) : links
      // call callback function to return suggestions
      cb(results)
    },
    createFilter(queryString) {
      return link => {
        return link.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0
      }
    },

    /**
     * The user has selected an existing attribute
     *
     * @todo implement
     */
    handleSelect({ key, name }) {
      console.log(key, name, this.sign_id)
      // const attribute = this.$store.getters.attributes[name]

      // this.$emit('add-attribute', attribute)
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
