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
    sign_char_id: undefined,
    scroll_version_id: undefined,
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
          name: `${this.corpus.signCharAttributeList.get(key).attribute_name}: 
          ${this.corpus.signCharAttributeList.get(key).attribute_value_name}`,
        })
      }
      var results = queryString ? links.filter(this.createFilter(queryString)) : links
      // call callback function to return suggestions
      cb(results)
    },
    createFilter(queryString) {
      return link => {
        return link.name.toLowerCase().indexOf(queryString.toLowerCase()) > -1
      }
    },

    /**
     * The user has selected an existing attribute
     *
     * @todo implement
     */
    handleSelect({ key, name }) {
      console.log(key, name, this.sign_id)
      this.corpus.signChars.addAttribute(this.sign_char_id, this.scroll_version_id, key)
    },
  },
}
</script>

<style lang="scss" scoped>
.attribute-input {
  width: calc(80% - 150px);
}
</style>
