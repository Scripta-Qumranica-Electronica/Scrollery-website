<template>
  <div class="add-new-dialog">
    <div class="add-new-menu">
        <div class="add-dialog-select">
          <add-new-combination-menu
            class="add-new-menu-select-item"
            :corpus="corpus"
            v-on:setCombination="setCombination"/>
          <add-new-image-reference-menu
            class="add-new-menu-select-item"
            :selected-combination="selectedCombination"
            :corpus="corpus"
            v-on:setImageReference="setImageReference"/>
          <add-new-artefact-menu
            v-if="addType === 'artefacts' && (selectedCombination || selectedImageReference)"
            class="add-new-menu-select-item"
            :selected-combination="selectedCombination"
            :selected-image-reference="selectedImageReference"
            :corpus="corpus"
            v-on:setArtefact="setArtefact"
            v-on:createNewArtefact="createNewArtefact"/>
        </div>
    </div>
    <!-- TODO add code to display selected columns -->
    <div class="add-new-display">
      <add-new-dialog-image
        v-if="selectedArtefact || selectedImageReference"
        :image-reference="selectedImageReference"
        :artefact="selectedArtefact"
        :scrollVersionId="selectedCombination"
        :corpus="corpus">
      </add-new-dialog-image>
    </div>
  </div>
</template>

<script>
import AddNewDialogImage from './AddNewDialogImage.vue'
import AddNewCombinationMenu from './AddNewCombinationMenu.vue'
import AddNewImageReferenceMenu from './AddNewImageReferenceMenu.vue'
import AddNewArtefactMenu from './AddNewArtefactMenu.vue'
export default {
  components: {
    addNewDialogImage: AddNewDialogImage,
    addNewCombinationMenu: AddNewCombinationMenu,
    addNewImageReferenceMenu: AddNewImageReferenceMenu,
    addNewArtefactMenu: AddNewArtefactMenu,
  },
  props: {
    addType: undefined,
    corpus: undefined,
  },
  data() {
    return {
      selectedCombination: undefined,
      selectedImageReference: undefined,
      selectedArtefact: undefined,
    }
  },
  methods: {
    setCombination(combination) {
      this.selectedCombination = combination
      this.selectedImageReference = undefined
      const payload =
        this.selectedCombination >= 0 ? { scroll_version_id: this.selectedCombination } : {}
      this.$store.commit('addWorking')
      this.corpus.imageReferences
        .populate(payload)
        .then(res => {
          this.$store.commit('delWorking')
        })
        .catch(err => {
          this.$store.commit('delWorking')
          console.log(err)
        })

      this.$store.commit('addWorking')
      this.corpus.artefacts
        .populate({
          transaction: 'getArtOfComb',
          scroll_version_id: this.selectedCombination,
        })
        .then(res => {
          this.$store.commit('delWorking')
        })
        .catch(err => {
          this.$store.commit('delWorking')
          console.log(err)
        })
    },
    setImageReference(imageReference) {
      this.selectedArtefact = undefined
      this.$store.commit('addWorking')
      if (imageReference && this.selectedCombination) {
        this.corpus.artefacts
          .populate({
            scroll_version_id: this.selectedCombination,
            image_catalog_id: this.selectedImageReference,
          })
          .then(res => {
            this.$store.commit('delWorking')
            this.selectedImageReference = undefined
            this.selectedImageReference = imageReference
          })
          .catch(err => {
            this.$store.commit('delWorking')
            console.log(err)
          })

        this.$store.commit('addWorking')
        this.corpus.images
          .populate({
            scroll_version_id: this.selectedCombination,
            image_catalog_id: imageReference,
          })
          .then(res => {
            this.$store.commit('delWorking')
            this.selectedImageReference = undefined
            this.selectedImageReference = imageReference
          })
          .catch(err => {
            this.$store.commit('delWorking')
            console.log(err)
          })
      }
    },
    setArtefact(artefact) {
      const newImageReference = this.corpus.artefacts.get(artefact).image_catalog_id
      this.$store.commit('addWorking')
      this.corpus.images
        .populate({
          image_catalog_id: newImageReference,
        })
        .then(res => {
          this.$store.commit('delWorking')
          this.selectedImageReference = newImageReference
        })
        .catch(err => {
          this.$store.commit('delWorking')
          console.log(err)
        })

      this.$store.commit('addWorking')
      this.corpus.artefacts
        .populate({
          scroll_version_id: this.selectedCombination,
          image_catalog_id: newImageReference,
        })
        .then(res => {
          this.$store.commit('delWorking')
          this.selectedArtefact = artefact
        })
        .catch(err => {
          this.$store.commit('delWorking')
          console.log(err)
        })
    },
    createNewArtefact() {},
  },
}
</script>

<style lang="scss" scoped>
@import '~sass-vars';
.add-new-menu {
  width: 20%;
  min-width: 20%;
  height: 65vh;
  min-height: 65vh;
  background: $ltBlue;
  float: left;
}
.add-dialog-select {
  height: 60px;
}
.add-dialog-menu-listings {
  overflow: auto;
  height: calc(60vh - 60px);
  min-height: calc(60vh - 60px);
}
.add-new-display {
  width: 80%;
  min-width: 80%;
  height: 65vh;
  min-height: 65vh;
  background: gray;
  margin-left: 20%;
  overflow: auto;
}

.add-new-menu-select-item {
  height: 20vh;
}
</style>
