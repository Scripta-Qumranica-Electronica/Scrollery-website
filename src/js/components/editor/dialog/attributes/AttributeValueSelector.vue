<template>
<div>
  <div v-if="isNumberValue">
    Enter Number: <input v-model="numberValue" @change="onNumberInput" />
  </div>
  <div v-else-if="isSingleValue">
    {{ singleValue }}
  </div>
  <div v-else>
    <el-dropdown @command="handleCommand">
      <span class="el-dropdown-link">
        {{ dropdownValue }}<i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item 
          v-for="value in canonicalValues"
          :key="value.attribute_value_id"
          :command="value"
          @click="selectValue(value)"
        >
          {{ value.string_value }} <span v-if="value.attribute_value_description">-</span> {{ value.attribute_value_description }} 
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</div>
</template>

<script>
/**
 * An attribute can support a number of possibilities
 *
 * A number value
 * A single, set value
 * A set of possible values
 *
 * This component provides the interface for these.
 */
export default {
  props: {
    attributeName: {
      type: String,
      required: true,
    },
    canonicalValues: {
      type: Array,
    },
    isSingleValue: {
      type: Boolean,
    },
    isNumberValue: {
      type: Boolean,
    },
    actualNumberValue: {
      required: false,
    },
    actualStringValue: {
      required: false,
    },
  },
  data() {
    return {
      numberValue: 0,
      dropdownValue: this.actualStringValue,
    }
  },
  computed: {
    singleValue() {
      return (
        this.canonicalValues[0] &&
        this.canonicalValues[0].string_value +
          (this.canonicalValues[0].attribute_value_description
            ? ': ' + this.canonicalValues[0].attribute_value_description
            : '')
      )
    },
  },
  methods: {
    handleCommand(value) {
      this.$emit('value-selected', value)
      this.dropdownValue = 'Add an attribute value'
    },
    onNumberInput() {
      const numberVal = parseInt(this.numberValue)

      if (typeof numberVal === 'number') {
        this.$emit('number-input', numberVal)
      }
    },
  },
  watch: {
    actualNumberValue() {
      this.numberValue = this.actualNumberValue
    },
  },
  mounted() {
    // if this is given a number value, copy it from the
    // prop onto the data attribute for use as v-model
    if (this.actualNumberValue !== null) {
      this.numberValue = this.actualNumberValue
    }
  },
}
</script>
