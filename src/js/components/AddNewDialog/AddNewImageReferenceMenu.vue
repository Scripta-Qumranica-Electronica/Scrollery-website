<template>
  <div>
    <div @click="show = !show">
        <i class="fa" :class="{'fa-caret-right': !show, 'fa-caret-down': show}"></i>
        <span>Images:</span>
    </div>
    <ul v-show="show">
      <li @click="setImageReference(-1)" >None</li>
      <li 
        v-if="selectedCombination !== undefined"
        v-for="imageReference in selectedCombination >= 0 ? corpus.combinations.get(selectedCombination).imageReferences : corpus.imageReferences.keys()" 
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
    }
  },
  methods: {
    setImageReference(imageReference) {
      this.$emit('setImageReference', imageReference)
    },
  },
  filters: {
    label(imageReference) {
      return `${imageReference.institution}: ${imageReference.lvl1}/${imageReference.lvl2} ${
        imageReference.side === 0 ? 'R' : 'V'
      }`
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
