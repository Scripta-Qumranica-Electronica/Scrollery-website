<template>
  <tr @click="$emit('selectAttribute', attribute.attribute_id)">
    <td class="attribute-name">
      {{ attribute.attribute_name }}
    </td>
    <td class="attribute-value-selection">
        <attribute-value-selector
          @value-selected="valueSelected"
          @number-input="numberInput"
          :attributeName="attribute.attribute_name"
          :canonicalValues="canonicalValues"
          :isSingleValue="isSingleValue"
          :isNumberValue="isNumberValue"
          :numberValue="actualNumberValue"
        />
        <div v-if="!isSingleValue" class="attribute-values">
          <span class="attribute-value" v-for="attributeValue in actualValues">
              {{ attributeValue.string_value }}   <span class="el-icon-circle-close-outline remove-atttribute" @click="valueRemoved(attributeValue)"></span>
          </span>
        </div>
    </td>
    <td class="attributed-description">
      {{ attribute.attribute_description }}
    </td>
    <!-- <td class="attribute-comments">
        <div :data-id="id"></div>
    </td> -->
    <td class="attribute-actions">
        <el-button 
          icon="el-icon-circle-check"
          size="small"
          :type='attribute.hasChanges() ? "primary" : "info"'
          :disabled='!attribute.hasChanges()'
          @click="onSave"
        />
        <el-button
          type="danger"
          size="small"
          icon="el-icon-delete"
          @click="onDelete"
        />
    </td>
  </tr>
</template>

<script>
import uuid from 'uuid/v1'
import Quill from 'quill'

// models
import AttributeValue from '~/models/AttributeValue.js'

// components
import AttributeValuesSelector from './AttributeValueSelector.vue'

export default {
  components: {
    'attribute-value-selector': AttributeValuesSelector,
  },
  props: ['attribute', 'sign'],

  data() {
    return {
      id: uuid(),
      quill: null,
      actualValues: [],
      canonicalValues: [],
    }
  },

  computed: {
    isNumberValue() {
      return this.isSingleValue && this.canonicalValues[0].type.toLowerCase() === 'number'
    },
    isSingleValue() {
      return this.canonicalValues.length === 1
    },
    singleValue() {
      return this.isSingleValue ? this.canonicalValues[0] : null
    },
    charAttributes() {
      return this.sign ? this.sign.getMainChar().attributes.getItems() : []
    },
    attributeValues() {
      return this.attribute && this.attribute.values ? this.attribute.values : { items: () => [] }
    },
    actualNumberValue() {
      // safeguard
      if (!this.isNumberValue) {
        return null
      }
      return this.actualValues[0] ? this.actualValues[0].attribute_numeric_value : null
    },
  },

  methods: {
    onDelete() {
      // if the attribute isn't persisted, then we can just remove it from the table
      if (this.attribute.isPersisted()) {
        let attributes = null
        switch (true) {
          case this.isNumberValue: // false
          case this.isSingleValue:
            this.$post('resources/cgi-bin/scrollery-cgi.pl', {
              transaction: 'removeSignAttribute',
              scroll_version_id: this.$route.params.scrollVersionID,
              signs: [
                {
                  sign_char_id: this.sign.getMainChar().sign_char_id,
                  attributes: [
                    {
                      sign_char_attribute_id: this.attribute.sign_char_attribute_id,
                    },
                  ],
                },
              ],
            })
              .then(res => console.log(res))
              .catch(err => console.error(err))
            break
          default:
            this.$post('resources/cgi-bin/scrollery-cgi.pl', {
              transaction: 'removeSignAttribute',
              scroll_version_id: this.$route.params.scrollVersionID,
              signs: [
                {
                  sign_char_id: this.sign.getMainChar().sign_char_id,
                  attributes: [
                    {
                      sign_char_attribute_id: this.attribute.sign_char_attribute_id,
                    },
                  ],
                },
              ],
            })
              .then(res => console.log(res))
              .catch(err => console.error(err))
            break
        }
      } else {
        this.$emit('delete-attribute', this.attribute.uuid)
      }
    },

    /**
     * Need to distinguish between numbers, single value attributes,
     * and multi-value attributes.
     */
    onSave() {
      let attributes = []
      switch (true) {
        case this.isNumberValue:
          if (this.actualNumberValue) {
            attributes.push({
              attribute_value_id: this.canonicalValues[0].attribute_value_id,
              attribute_numeric_value: this.actualNumberValue,
              sequence: 1,
            })
          }
          break
        case this.isSingleValue:
          attributes.push({
            attribute_value_id: this.canonicalValues[0].attribute_value_id,
            attribute_numeric_value: null,
            sequence: 1,
          })
          break
        default:
          // it's a multi-select
          this.actualValues.forEach((value, i) => {
            if (!value.isPersisted()) {
              attributes.push({
                attribute_value_id: value.attribute_value_id,
                attribute_numeric_value: null,
                sequence: i,
              })
            }
          })
          break
      }

      // if we have anything to save, persist that.
      if (attributes && attributes.length) {
        this.$post('resources/cgi-bin/scrollery-cgi.pl', {
          transaction: 'addSignAttribute',
          scroll_version_id: this.$route.params.scrollVersionID,
          signs: [
            {
              sign_char_id: this.sign.getMainChar().sign_char_id,
              attributes,
            },
          ],
        })
          .then(res => {
            console.log(res)
          })
          .catch(err => console.error(err))
      }
    },
    valueRemoved(value) {
      var i = this.attributeValues.findIndex(
        attr => attr.attribute_value_id === value.attribute_value_id
      )
      if (i > -1) {
        this.attributeValues.delete(i)

        // trigger a reactive re-render
        this.actualValues = this.attributeValues.items()
      }
    },
    valueSelected(value) {
      // safeguard to ensure no duplicate attribute values
      if (
        !this.attributeValues.find(attr => attr.attribute_value_id === value.attribute_value_id)
      ) {
        this.attributeValues.push(new AttributeValue(value))

        // trigger a reactive re-render
        this.actualValues = this.attributeValues.items()
      }
    },

    numberInput(value) {
      if (this.isNumberValue && value >= 1) {
        // only allow a single value
        if (this.attributeValues.length) {
          this.attributeValues.delete(0)
        }

        // push on the new value
        this.attributeValues.push(
          new AttributeValue({
            ...this.singleValue,
            attribute_numeric_value: value,
          })
        )

        // trigger a reactive re-render
        this.actualValues = this.attributeValues.items()
      }
    },
  },

  mounted() {
    const canonicalAttribute = this.$store.getters.cannonicalAttribute(
      this.attribute.attribute_name
    )
    this.canonicalValues = canonicalAttribute ? canonicalAttribute.values : []
  },
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
