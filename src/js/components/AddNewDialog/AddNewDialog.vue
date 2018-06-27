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
    <!-- TODO add more code to display the selected data -->
    <div class="add-new-display">
      <image-menu
        :corpus="corpus"
        :images="filenames"
        :imageSettings="imageSettings"
        :artefact="artefact"
        :zoom="zoom"
        :viewMode="viewMode"
        :artefact-editable="false"
        :roi-editable="false"
        :brushCursorSize="brushCursorSize"
        v-on:opacity="setOpacity"
        v-on:changeBrushSize="changeBrushSize"
        v-on:visible="toggleVisible"
        v-on:drawingMode="toggleDrawingMode"
        v-on:toggleMask="toggleMask"
        v-on:delSelectedRoi="delSelectedRoi"
        v-on:changeViewMode="changeViewMode"
        v-on:changeZoom="changeZoom">
      </image-menu>
      <add-new-dialog-image
        v-if="selectedArtefact || selectedImageReference"
        :image-reference="selectedImageReference"
        :artefact="selectedArtefact"
        :corpus="corpus">
      </add-new-dialog-image>
        <!-- <svg v-if="images || artefacts">

        </svg> -->
    </div>
  </div>
</template>

<script>
import AddNewDialogImage from './AddNewDialogImage.vue'
import AddNewCombinationMenu from './AddNewCombinationMenu.vue'
import AddNewImageReferenceMenu from './AddNewImageReferenceMenu.vue'
import AddNewArtefactMenu from './AddNewArtefactMenu.vue'
import ImageMenu from '~/components/ImageMenu.vue'
export default {
  components: {
    addNewDialogImage: AddNewDialogImage,
    addNewCombinationMenu: AddNewCombinationMenu,
    addNewImageReferenceMenu: AddNewImageReferenceMenu,
    addNewArtefactMenu: AddNewArtefactMenu,
    imageMenu: ImageMenu,
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
      this.corpus.imageReferences.populate(payload).catch(err => {
        console.log(err)
      })
      this.corpus.artefacts
        .populate({
          transaction: 'getArtOfComb',
          scroll_version_id: this.selectedCombination,
        })
        .catch(err => {
          console.log(err)
        })
    },
    setImageReference(imageReference) {
      if (imageReference && this.selectedCombination) {
        this.corpus.images
          .populate({
            scroll_version_id: this.selectedCombination,
            image_catalog_id: imageReference,
          })
          .then(res => {
            this.selectedImageReference = imageReference
          })
          .catch(err => {
            console.log(err)
          })
        this.corpus.artefacts
          .populate({
            scroll_version_id: this.selectedCombination,
            image_catalog_id: this.selectedImageReference,
          })
          .catch(err => {
            console.log(err)
          })
      }
    },
    setArtefact(artefact) {
      this.selectedArtefact = artefact
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
