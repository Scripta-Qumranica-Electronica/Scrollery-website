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
            v-on:setArtefact="setArtefact"/>
        </div>
        <div class="add-dialog-menu-listings">
            <!-- <ul>
                <li 
                    v-if="addType === 'artefacts' && selectedImage >= 0" 
                    v-for="artefact in selectedImage ? corpus.imageReferences.get(selectedImage).artefacts : corpus.combinations.get(selectedCombination).artefacts"
                    :key="'addmenu-artefact-' + selectedCombination + '-' + artefact">{{corpus.artefacts.get(artefact).name}}</li>
                <li 
                    v-if="addType === 'columns' && selectedCombination >= 0"
                    v-for="column in columns"
                    :key="column.id">{{column.name}}
                </li>
            </ul> -->
        </div>
    </div>
    <!-- TODO add code to display the selected data -->
    <div class="add-new-display">
        <div>

        </div>
        <!-- <svg v-if="images || artefacts">

        </svg> -->
    </div>
  </div>
</template>

<script>
import AddNewCombinationMenu from './AddNewCombinationMenu.vue'
import AddNewImageReferenceMenu from './AddNewImageReferenceMenu.vue'
import AddNewArtefactMenu from './AddNewArtefactMenu.vue'
export default {
  components: {
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
    }
  },
  methods: {
    setCombination(combination) {
      this.selectedCombination = combination
      this.selectedImageReference = undefined
      const payload =
        this.selectedCombination >= 0 ? { scroll_version_id: this.selectedCombination } : {}
      this.corpus.imageReferences.populate(payload)
      this.corpus.artefacts.populate({
        transaction: 'getArtOfComb',
        scroll_version_id: this.selectedCombination,
      })
    },
    setImageReference(imageReference) {
      this.selectedImageReference = imageReference
      if (this.selectedCombination) {
        this.corpus.artefacts.populate({
          scroll_version_id: this.selectedCombination,
          image_catalog_id: this.selectedImageReference,
        })
      }
    },
    setArtefact(artefact) {
      console.log(artefact)
    },
  },
  // watch: {
  //   selectedCombination(to, from) {
  //     if (to !== from) {
  //       const postData = to === -1 ? {} : {scroll_version_id: to}
  //       this.corpus.imageReferences.populate(postData)
  //         // .then(res => {
  //         //   this.selectedImage = this.corpus.combinations.get(to).images[0] || undefined
  //         // })
  //       // this.corpus.artefacts.
  //     }
  //   },
  //   selectedImage(to, from) {
  //     if (to !== from) {
  //       this.corpus.artefacts.populate({scroll_version_id: this.selectedCombination, image_catalog_id: to})
  //     }
  //   },
  // },
}
</script>

<style lang="scss" scoped>
@import '~sass-vars';
.add-new-dialog {
  height: 70vh;
  min-height: 70vh;
  max-height: 70vh;
}
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
}

.add-new-menu-select-item {
  height: 20vh;
}
</style>
