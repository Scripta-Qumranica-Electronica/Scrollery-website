<template>
  <tr>
    <td class="attribute">
      {{ attribute.attribute }}
    </td>
    <td class="attributed-description">

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

export default {
  props: ['attribute'],

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
