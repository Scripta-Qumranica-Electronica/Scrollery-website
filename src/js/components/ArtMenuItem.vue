<template>
  <span class="clickable-menu-item" @click="setRouter">
    Artefact: {{dataId}}
  </span>
</template>

<script>

export default {
  props: {
    dataId: Number,
  },
  data() {
    return {
    }
  },
  computed: {
  },
  methods: {
    setRouter() {
        this.$router.push({ name: 'workbenchAddress',
                          params: { scrollID: this.$route.params.scrollID,
                                    scrollVersionID: this.$route.params.scrollVersionID,
                                    colID: this.$route.params.colID ? this.$route.params.colID : '-1',
                                    imageID: this.$route.params.imageID ? this.$route.params.imageID : '-1',
                                    artID: this.dataId }
        })
    },
  },
}
</script>

