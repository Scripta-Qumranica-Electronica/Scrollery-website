<template>
  <tr>
    <td>{{corpus.signCharAttributeList.get(attribute_value).attribute_name}}</td>
    <td>{{corpus.signCharAttributeList.get(attribute_value).attribute_value_name}}</td>
    <td>{{corpus.signCharAttributeList.get(attribute_value).attribute_description}}</td>
    <!--Don't show the delete button if attribute is of type LETTER (=1).-->
    <!--I'm not sure what use we have for deleting that attribute, since users can just delete the letter-->
    <td v-if="attribute_value !== 1"><el-button type="danger" size="mini" @click="removeAttribute">Delete</el-button></td>
  </tr>
</template>

<script>
export default {
  components: {},

  props: {
    corpus: undefined,
    scroll_version_id: undefined,
    sign_char_id: undefined,
    attribute_value: undefined,
    sign_char_attribute_id: undefined,
  },

  data() {
    return {}
  },

  computed: {},

  methods: {
    removeAttribute() {
      this.corpus.signChars.removeSignAttribute(
        this.sign_char_id,
        this.scroll_version_id,
        this.sign_char_attribute_id
      )
    },
  },

  mounted() {},
}
</script>

<style scoped lang="scss">
.attribute-name {
  text-align: center;
}

.attribute-value-selection {
  max-width: 250px;
}

.attribute-values {
  display: block;
}

.attribute-value {
  display: inline-block;
  padding: 5px 7px;
  margin-top: 5px;
  margin-right: 5px;
  background-color: #eee;
  border-radius: 10px;
}
</style>
