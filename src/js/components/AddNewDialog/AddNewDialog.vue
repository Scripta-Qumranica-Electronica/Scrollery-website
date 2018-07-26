<template>
  <div class="add-new-dialog">
    <div class="add-new-menu">
        <div class="add-dialog-select">
          <add-new-combination-menu
            class="add-new-menu-select-item"
            :selectedCombination="selectedCombination"
            :corpus="corpus"
            v-on:setCombination="setCombination"/>
          <add-new-image-reference-menu
            v-if="addType === 'artefacts'"
            class="add-new-menu-select-item"
            :selected-combination="selectedCombination"
            :selectedImageReference="selectedImageReference"
            :corpus="corpus"
            v-on:setImageReference="setImageReference"/>
          <add-new-artefact-menu
            v-if="addType === 'artefacts' && 
              ((selectedCombination && corpus.combinations.get(selectedCombination).artefacts) || 
              (selectedImageReference && corpus.imageReferences.get(selectedImageReference).artefacts))"
            class="add-new-artefact-menu-select-item"
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
        v-if="addType === 'artefacts' && (selectedArtefact || selectedImageReference)"
        :image-reference="selectedImageReference"
        :artefact="selectedArtefact"
        :scrollVersionID="selectedCombination"
        :corpus="corpus">
      </add-new-dialog-image>
      <editor
        v-if="addType === 'columns' && selectedColumn"
        :scrollVersionID="selectedCombination"
        :colID="selectedColumn">
      </editor>
    </div>
    <div class="add-new-dialog-footer">
      <el-button 
        type="primary" 
        class="commit-button" 
        @click="commitNewArtefact()">Commit</el-button>
    </div>
  </div>
</template>

<script>
import AddNewDialogImage from './AddNewDialogImage.vue'
import AddNewCombinationMenu from './AddNewCombinationMenu.vue'
import AddNewImageReferenceMenu from './AddNewImageReferenceMenu.vue'
import AddNewArtefactMenu from './AddNewArtefactMenu.vue'
import Editor from '~/components/editor/Editor.vue'

export default {
  components: {
    addNewDialogImage: AddNewDialogImage,
    addNewCombinationMenu: AddNewCombinationMenu,
    addNewImageReferenceMenu: AddNewImageReferenceMenu,
    addNewArtefactMenu: AddNewArtefactMenu,
    editor: Editor,
  },
  props: {
    addType: undefined,
    corpus: undefined,
    currentScrollVersionID: undefined,
  },
  data() {
    return {
      selectedCombination: undefined,
      selectedImageReference: undefined,
      selectedArtefact: undefined,
      selectedColumn: undefined,
    }
  },
  methods: {
    setCombination(combination) {
      this.selectedArtefact = undefined
      this.selectedImageReference = undefined
      this.selectedCombination = combination
      const payload =
        this.selectedCombination >= 0 ? { scroll_version_id: this.selectedCombination } : {}
      this.$store.commit('addWorking')
      this.corpus.imageReferences
        .populate(payload)
        .then(res => {
          /* istanbul ignore next */
          this.$store.commit('delWorking')
        })
        .catch(err => {
          /* istanbul ignore next */
          this.$store.commit('delWorking')
          /* istanbul ignore next */
          console.error(err)
        })

      this.$store.commit('addWorking')
      this.corpus.artefacts
        .populate({
          transaction: 'getArtOfComb',
          scroll_version_id: this.selectedCombination,
        })
        .then(res => {
          /* istanbul ignore next */
          this.$store.commit('delWorking')
        })
        .catch(err => {
          /* istanbul ignore next */
          this.$store.commit('delWorking')
          /* istanbul ignore next */
          console.error(err)
        })
    },
    setImageReference(imageReference) {
      this.selectedArtefact = undefined
      this.$store.commit('addWorking')
      if (imageReference && this.selectedCombination) {
        this.corpus.artefacts
          .populate({
            scroll_version_id: this.selectedCombination,
            image_catalog_id: imageReference,
          })
          .then(res => {
            /* istanbul ignore next */
            this.$store.commit('delWorking')
            /* istanbul ignore next */
            this.selectedImageReference = undefined
            /* istanbul ignore next */
            this.selectedImageReference = imageReference
          })
          .catch(err => {
            /* istanbul ignore next */
            this.$store.commit('delWorking')
            /* istanbul ignore next */
            console.error(err)
          })

        this.$store.commit('addWorking')
        this.corpus.images
          .populate({
            scroll_version_id: this.selectedCombination,
            image_catalog_id: imageReference,
          })
          .then(res => {
            /* istanbul ignore next */
            this.$store.commit('delWorking')
            /* istanbul ignore next */
            this.selectedImageReference = undefined
            /* istanbul ignore next */
            this.selectedImageReference = imageReference
          })
          .catch(err => {
            /* istanbul ignore next */
            this.$store.commit('delWorking')
            /* istanbul ignore next */
            console.error(err)
          })
      }
    },
    setArtefact(artefact) {
      const newImageReference = this.corpus.artefacts.get(artefact, this.selectedCombination)
        .image_catalog_id
      this.$store.commit('addWorking')
      this.corpus.images
        .populate({
          image_catalog_id: newImageReference,
        })
        .then(res => {
          /* istanbul ignore next */
          this.$store.commit('delWorking')
          /* istanbul ignore next */
          this.selectedImageReference = newImageReference
          this.$store.commit('addWorking')
          return this.corpus.artefacts.populate({
            scroll_version_id: this.selectedCombination,
            image_catalog_id: newImageReference,
          })
        })
        .then(res => {
          /* istanbul ignore next */
          this.$store.commit('delWorking')
          /* istanbul ignore next */
          this.selectedArtefact = artefact
        })
        .catch(err => {
          /* istanbul ignore next */
          this.$store.commit('delWorking')
          /* istanbul ignore next */
          console.error(err)
        })
    },
    createNewArtefact() {
      this.selectedArtefact = undefined
    },

    /**
     * TODO: finish this when you life becomes more bearable...
     */
    commitNewArtefact() {
      if (this.selectedArtefact || this.selectedImageReference) {
        const image_catalog_id = this.selectedArtefact
          ? this.corpus.artefacts.get(this.selectedArtefact, this.selectedCombination)
              .image_catalog_id
          : this.corpus.imageReferences.get(this.selectedImageReference).image_catalog_id
        const id_of_sqe_image = this.selectedArtefact
          ? this.corpus.artefacts.get(this.selectedArtefact, this.selectedCombination)
              .id_of_sqe_image
          : this.corpus.imageReferences.get(this.selectedImageReference).master_sqe_image_id
        const region_in_master_image = this.selectedArtefact
          ? this.corpus.artefacts.get(this.selectedArtefact, this.selectedCombination).mask
          : 'POLYGON((0 0,0 0,0 0,0 0))'
        this.corpus.artefacts
          .addNewArtefact(
            this.currentScrollVersionID,
            id_of_sqe_image,
            image_catalog_id,
            region_in_master_imageregion_in_master_image
          )
          .then(res => {
            const h = this.$createElement
            this.$notify({
              title: 'Add artefact',
              message: h('i', { style: 'color: teal' }, 'The artefact was succesfully created'),
            })
          })
          .catch(err => {
            console.error(err)
            const h = this.$createElement
            this.$notify({
              title: 'Add artefact',
              message: h('i', { style: 'color: red' }, 'There was an error creating the artefact.'),
            })
          })
      }
    },
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
  user-select: none;
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
.add-new-artefact-menu-select-item {
  height: 25vh;
}
.add-new-dialog-footer {
  width: 100%;
  height: 5vh;
}
.commit-button {
  float: right;
  margin-top: 10px;
}
</style>
