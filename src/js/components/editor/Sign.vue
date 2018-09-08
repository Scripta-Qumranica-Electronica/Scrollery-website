<template>
  <span>
      <span class="sign" v-if="sign_id">{{corpus.signChars.get(corpus.signs.get(sign_id).sign_chars[char]).char}}</span>
  </span>
</template>

<script>
// models
import Sign from './Sign.vue'
export default {
  name: 'sign',
  components: {
    sign: Sign,
  },
  data() {
    return {
      char: 0,
      next: 0,
    }
  },
  props: {
    corpus: undefined,
    sign_id: undefined,
  },
  computed: {
    next_sign_id() {
      return this.sign_id && this.corpus.signs.get(this.sign_id).next_sign_ids[this.next]
        ? this.corpus.signs.get(this.sign_id).next_sign_ids[this.next]
        : undefined
    },
  },
  methods: {},
}
</script>
