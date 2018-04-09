<template>
  <div class="add-new-dialog">
    <div class="add-new-menu">
        <div class="add-dialog-select">
            <el-select 
                class="combinationSelector" 
                v-model="selectedCombination" 
                placeholder="Select a combination" 
                size="mini">
                <el-option
                    v-for="combination in corpus.combinations._itemList"
                    :key="'addmenu-combination-' + combination"
                    :label="`${corpus.combinations.itemWithID(combination).name} - ${corpus.combinations.itemWithID(combination).version}`"
                    :value="combination">
                </el-option>
            </el-select>
            <el-select 
                v-if="addType === 'artefacts'" 
                class="imageSelector" 
                v-model="selectedImage" 
                placeholder="Select an image" 
                size="mini">
                <el-option
                    v-if="selectedCombination"
                    v-for="image in corpus.combinations.itemWithID(selectedCombination).images"
                    :key="'addmenu-image-' + image"
                    :label="`${corpus.images.itemWithID(image).institution}: ${corpus.images.itemWithID(image).lvl1}, ${corpus.images.itemWithID(image).lvl2} ${corpus.images.itemWithID(image).side === 0 ? 'R' : 'V'}`"
                    :value="image">
                </el-option>
            </el-select>
        </div>
        <div class="add-dialog-menu-listings">
            <ul>
                <li 
                    v-if="addType === 'artefacts' && selectedImage" 
                    v-for="artefact in corpus.images.itemWithID(selectedImage).artefacts"
                    :key="'addmenu-artefact-' + artefact">{{corpus.artefacts.itemWithID(artefact).name}}</li>
                <li 
                    v-if="addType === 'columns'"
                    v-for="column in columns"
                    :key="column.id">{{column.name}}
                </li>
            </ul>
        </div>
    </div>
    <!-- TODO add code to display the selected data -->
    <div class="add-new-display">
        <div v-if="columns">

        </div>
        <svg v-if="images || artefacts">

        </svg>
    </div>
  </div>
</template>

<script>

export default {
    props: {
        addType: '',
        initialCombination: '',
        initialImage: '',
        corpus: {},
    },
    data() {
        return {
            combinations: [],
            images: [],
            artefacts: [],
            columns: [],
            selectedCombination: this.initialCombination,
            selectedImage: this.initialImage,
        }
    },
    watch: {
        selectedCombination(to, from) {
            if (to !== from) {
                this.corpus.populateImagesOfScrollVersion(to, this.corpus.combinations.itemWithID(to).scroll_id)
                .then(res => {
                    this.selectedImage = this.corpus.combinations.itemWithID(to).images[0] || 
                    undefined
                })
            }
        },
        selectedImage(to, from) {
            if (to !== from) {
                this.corpus.populateArtefactsofImage(this.selectedCombination, to)
            }
        }
    },
}
</script>

<style lang="scss" scoped>
    @import "~sass-vars";
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
</style>