<template>
  <div>
    <div>
        <span>Artefacts ({{artefactReferences.length}}): {{selectedArtefact ? corpus.artefacts.get(selectedArtefact).name : ''}}</span>
    </div>
    <ul>
      <li 
        class="add-new-artefact-in-dialog"
        v-show="selectedCombination !== undefined && selectedImageReference !== undefined" 
        @click="createNewArtefact()">
        <span>Create New</span>
        <i class="fa fa-plus"></i>
      </li>
      <li 
        v-if="selectedCombination !== undefined"
        v-for="artefact in artefactReferences"
        :key="'add-new-menu-artefact-' + artefact"
        @click="setArtefact(artefact)"
        :style="{background: selectedArtefact === artefact ? 'lightblue' : '#222f5b'}">
        {{corpus.artefacts.get(artefact) | label}}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    selectedImageReference: undefined,
    selectedCombination: undefined,
    corpus: undefined,
  },
  data() {
    return {
      selectedArtefact: undefined,
    }
  },
  methods: {
    setArtefact(artefact) {
      this.selectedArtefact = artefact
      this.$emit('setArtefact', artefact)
    },
    createNewArtefact() {
      this.$emit('createNewArtefact')
    },
  },
  computed: {
    artefactReferences() {
      return this.selectedImageReference >= 0
        ? this.corpus.imageReferences.get(this.selectedImageReference).artefacts
        : this.selectedCombination >= 0
          ? this.corpus.combinations.get(this.selectedCombination).artefacts
          : []
    },
  },
  filters: {
    label(artefact) {
      return artefact ? `${artefact.name} - ${artefact.catalog_side ? 'V' : 'R'}` : ''
    },
  },
}
</script>

<style lang="scss" scoped>
ul {
  max-height: 80%;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
