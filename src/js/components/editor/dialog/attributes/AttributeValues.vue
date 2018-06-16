<template>
<div>
  <div v-if="isSingleValue">
    {{ singleValue }}
  </div>
  <div v-else>
    <el-dropdown @command="handleCommand">
      <span class="el-dropdown-link">
        {{ dropdownValue }}<i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item 
          v-for="value in values"
          :key="value.attribute_value_id"
          :command="value"
          @click="selectValue(value)"
        >
          {{ value.string_value }}: {{ value.attribute_value_description }} 
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</div>
</template>

<script>
export default {
  props: ['values'],
  data() {
    return {
      dropdownValue: 'Select a value',
    }
  },
  computed: {
    isSingleValue() {
      return this.values && this.values.length === 1
    },
    singleValue() {
      return (
        this.values[0] &&
        this.values[0].string_value + ': ' + this.values[0].attribute_value_description
      )
    },
  },
  methods: {
    handleCommand(value) {
      this.dropdownValue = value.string_value
      this.$emit('value-selected', value)
    },
  },
}
</script>
