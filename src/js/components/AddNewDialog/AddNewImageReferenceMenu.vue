<template>
  <div>
    <div @click="show = !show">
        <i class="fa" :class="{'fa-caret-right': !show, 'fa-caret-down': show}"></i>
        <span>Images ({{imageReferences.length}}): {{corpus.imageReferences.get(selectedImageReference) | label}}</span>
    </div>
    <ul v-show="show">
      <li 
        v-if="selectedCombination !== undefined"
        v-for="imageReference in imageReferences" 
        :key="'add-new-menu-image-' + imageReference"
        @click="setImageReference(imageReference)">
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
    corpus: undefined,
  },
  data() {
    return {
      show: false,
      queryString: '',
      selectedImageReference: undefined,
    }
  },
  methods: {
    setImageReference(imageReference) {
      this.selectedImageReference = imageReference
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
  max-height: 60%;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
