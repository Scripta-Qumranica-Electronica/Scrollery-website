<template>
  <tr>
    <td class="attribute">
      {{ attribute.name }}
    </td>
    <td class="attributed-description">
      {{ attribute.attribute_description }}
    </td>
    <td class="attribute-value">
      <attribute-values
        @value-selected="valueSelected"
        :values="attribute.values"
      />
    </td>
    <td class="attribute-comments">
        <div :data-id="id"></div>
    </td>
    <td class="attribute-actions">
        <el-button type="danger" icon="el-icon-delete" @click="onDelete"></el-button>
    </td>
  </tr>
</template>

<script>
import uuid from 'uuid/v1'
import Quill from 'quill'

import AttributeValues from './AttributeValues.vue'

export default {
  components: {
    'attribute-values': AttributeValues,
  },
  props: ['attribute', 'sign'],

  data() {
    return {
      id: uuid(),
      quill: null,
    }
  },

  methods: {
    onDelete() {
      this.$emit('delete-attribute', this.attribute.uuid)
    },
    valueSelected(value) {
      // "signs": [
      //   {
      //     "sign_char_id": 540125,
      //     "attributes": [
      //       {
      //         "attribute_value_id": 21,
      //         "attribute_numeric_value": null,
      //         "sequence": 1
      //       }
      //     ]
      //   }
      // ]

      this.$post('resources/cgi-bin/scrollery-cgi.pl', {
        transaction: 'addSignAttribute',
        scroll_version_id: this.$route.params.scrollVersionID,
        signs: [
          {
            sign_char_id: this.sign.getMainChar().sign_char_id,
            attributes: [
              {
                attribute_value_id: value.attribute_value_id,
                attribute_numeric_value: null,
                sequence: 1,
              },
            ],
          },
        ],
      })
        .then(res => {})
        .catch(err => console.error(err))
    },
  },

  mounted() {
    this.quill = new Quill(`[data-id="${this.id}"]`, {
      theme: 'snow',
      modules: {
        toolbar: false,
      },
    })
  },
}
</script>
