<template>
  <div>
    <div class="hide-show-images" @click="show = !show">
        <i class="fa" :class="{'fa-caret-right': !show, 'fa-caret-down': show}"></i>
        <span>Images ({{imageReferences.length}}): {{corpus.imageReferences.get(selectedImageReference) | label}}</span>
    </div>
    <ul v-show="show">
      <li 
        v-if="selectedCombination !== undefined"
        v-for="imageReference in imageReferences" 
        :key="'add-new-menu-image-' + imageReference"
        @click="setImageReference(imageReference)"
        :style="{background: selectedImageReference === imageReference ? 'lightblue' : '#222f5b'}">
        {{corpus.imageReferences.get(imageReference) | label}}
        <i class="fa" 
          :class="{
            'fa-check-circle-o': corpus.imageReferences.get(imageReference).master_sqe_image_id !== undefined, 
            'fa-exclamation-circle': corpus.imageReferences.get(imageReference).master_sqe_image_id === undefined
            }"></i>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    selectedCombination: undefined,
    selectedImageReference: undefined,
    corpus: undefined,
  },
  data() {
    return {
      show: true,
      queryString: '',
    }
  },
  methods: {
    setImageReference(imageReference) {
      this.$emit('setImageReference', imageReference)
    },
  },
  computed: {
    imageReferences() {
      return this.selectedCombination >= 0
        ? this.corpus.combinations.get(this.selectedCombination).imageReferences
        : this.corpus.imageReferences.keys()
    },
  },
  filters: {
    label(imageReference) {
      return imageReference
        ? `${imageReference.institution}: ${imageReference.lvl1}/${imageReference.lvl2} ${
            imageReference.side === 0 ? 'R' : 'V'
          }`
        : ''
    },
  },
}
</script>

<style lang="scss" scoped>
ul {
  max-height: 12vh;
  overflow-y: auto;
  overflow-x: hidden;
}
.fa-check-circle-o {
  color: green;
}
.fa-exclamation-circle {
  color: red;
}
</style>
