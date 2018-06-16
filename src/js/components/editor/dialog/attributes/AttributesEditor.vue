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
        <th>Comments</th>
        <th>Actions</th>
      </thead>
      <tbody>
        <attribute-row v-for="attribute in attributes"
          :key="attribute.uuid"
          :attribute="attribute"
          :sign="sign"
          @delete-attribute="deleteAttribute"
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
      attributeName: '',
      attributes: [],
    }
  },
  methods: {
    addNewAttribute(attribute) {
      // add it to the table
      this.attributes.push(attribute)

      // add it to the model.
      const modelAttribute = { ...attribute }
      modelAttribute.values = []
      this.sign.addAttribute(attribute)
    },
    deleteAttribute(attributeID) {
      this.sign.removeAttribute(attributeID)
      this.attributes = this.sign.attributes.items()
    },
  },
  watch: {
    sign() {
      this.attributes = this.sign ? this.sign.attributes().items() : []
    },
  },
}
</script>

<style lang="scss">
.attributes-table {
  width: 100%;
}
</style>
