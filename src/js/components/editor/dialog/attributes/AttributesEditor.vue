<template>
  <section>
    <attribute-search
      :corpus="corpus"
      :sign_char_id="corpus.signChars.get(corpus.signs.getSignChar(sign, scroll_version_id), scroll_version_id).sign_char_id"
      :scroll_version_id="scroll_version_id"
    />
    <table class="attributes-table">
      <thead>
        <th>Attribute</th>
        <th>Attribute Value</th>
        <th>Description</th>
        <!-- <th>Comments</th> -->
        <th>Actions</th>
      </thead>
      <tbody>
        <attribute-row 
          v-for="attribute in corpus.signChars.get(corpus.signs.getSignChar(sign, scroll_version_id), scroll_version_id).attribute_values"
          :key="`attribute-${attribute.value}`"
          :corpus="corpus"
          :attribute_value="attribute"
          :sign_char_id="corpus.signs.getSignChar(sign, scroll_version_id)"
          :scroll_version_id="scroll_version_id"
          :class="selectedAttribute === attribute.attribute_id ? 'selected-char-attribute' : ''"
        />
      </tbody>
    </table>
  </section>
</template>

<script>
// components
import AttribueSearch from './AttributeSearch.vue'
import AttributeRow from './AttributeRow.vue'

export default {
  components: {
    'attribute-row': AttributeRow,
    'attribute-search': AttribueSearch,
  },
  props: {
    sign: undefined,
    corpus: undefined,
    scroll_version_id: undefined,
  },
  data() {
    return {
      attributes: [],
      attributeName: '',
      selectedAttribute: undefined,
    }
  },
  methods: {
    /**
     * @param {object} attribute  the canonical attribute that has all values
     */
    addNewAttribute(attribute) {
      // prepare the model attribute
      const modelAttribute = { ...attribute }

      // remove values from the canonical attribute
      // so the user can select what values they want.
      modelAttribute.values = []
      this.attributes = this.sign.addAttribute(modelAttribute)
    },
    deleteAttribute(attributeID) {
      this.sign.removeAttribute(attributeID)
      this.attributes = this.sign.getMainChar().attributes.items()
    },
    selectAttribute(attribute) {
      this.selectedAttribute = attribute
      this.$emit('selectAttribute', attribute)
    },
  },
  watch: {},
  mounted() {},
}
</script>

<style lang="scss">
.attributes-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 5px;
  border: 1px solid #eee;
  border-radius: 3px;

  tr {
    padding: 0px 3px;
    border-bottom: 1px solid #eee;
  }
}

thead {
  background-color: #eee;
}

.selected-char-attribute {
  background: lightblue;
}
</style>
