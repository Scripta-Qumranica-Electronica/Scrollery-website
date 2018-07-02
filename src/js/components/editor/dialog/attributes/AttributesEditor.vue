<template>
  <section>
    <attribute-search
      @add-attribute="addNewAttribute"
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
        <attribute-row v-for="attribute in attributes"
          :key="attribute.getUUID()"
          :attribute="attribute"
          :sign="sign"
          :class="selectedAttribute === attribute.sign_char_attribute_id ? 'selected-char-attribute' : ''"
          @delete-attribute="deleteAttribute(attribute.getUUID())"
          @selectAttribute="selectAttribute"
        />
      </tbody>
    </table>
  </section>
</template>

<script>
// models
import Sign from '~/models/Sign.js'

// components
import AttribueSearch from './AttributeSearch.vue'
import Attribute from './Attribute.vue'

export default {
  components: {
    'attribute-row': Attribute,
    'attribute-search': AttribueSearch,
  },
  props: {
    sign: {
      type: Sign,
    },
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
  watch: {
    sign() {
      this.attributes = this.sign ? this.sign.getMainChar().attributes.items() : []
    },
  },
  mounted() {
    if (this.sign) {
      this.attributes = this.sign.getMainChar().attributes.items()
    }
  },
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
