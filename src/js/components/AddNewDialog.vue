<template>
  <div class="addNewDialog">
    <div class="addNewMenu">
        <div class="addDialogSelect">
            <el-select 
                class="combinationSelector" 
                v-model="selectedCombination" 
                placeholder="Select a combination" 
                size="mini">
                <el-option
                    v-for="combination in combinations"
                    :key="combination.version_id"
                    :label="`${combination.name} - ${combination.version}`"
                    :value="combination.version_id">
                </el-option>
            </el-select>
            <el-select 
                v-if="addType === 'artefacts'" 
                class="imageSelector" 
                v-model="selectedImage" 
                placeholder="Select an image" 
                size="mini">
                <el-option
                    v-for="image in images"
                    :key="image.id"
                    :label="`${image.institution}: ${image.lvl1}-${image.lvl2}, ${image.side >>> 0 === 0 ? 'R' : 'V'}`"
                    :value="image.id">
                </el-option>
            </el-select>
        </div>
        <div class="addDialogueMenuListings">
            <ul>
                <li 
                    v-if="addType === 'artefacts'" 
                    v-for="artefact in artefacts"
                    :key="artefact.artefact_id">{{artefact.name}}</li>
                <li 
                    v-if="addType === 'columns'"
                    v-for="column in columns"
                    :key="column.id">{{column.name}}
                </li>
            </ul>
        </div>
    </div>
    <div class="addNewDisplay">
        <div v-if="columns">

        </div>
        <svg v-if="images || artefacts">

        </svg>
    </div>
  </div>
</template>

<style lang="scss" scoped>
    @import "~sass-vars";
    .addNewDialog {
        height: 70vh;
        min-height: 70vh;
        max-height: 70vh;
    }
    .addNewMenu {
        width: 20%;
        min-width: 20%;
        height: 65vh;
        min-height: 65vh;
        background: $ltBlue;
        float: left;
    }
    .addDialogSelect {
        height: 60px;
    }
    .addDialogueMenuListings {
        overflow: auto;
        height: calc(60vh - 60px);
        min-height: calc(60vh - 60px);
    }
    .addNewDisplay {
        width: 80%;
        min-width: 80%;
        height: 65vh;
        min-height: 65vh;
        background: gray;
        margin-left: 20%;
    }
</style>


<script>

export default {
    props: {
        addType: '',
        initialCombination: '',
        initialImage: '',
    },
    data() {
        return {
            combinations: [],
            images: [],
            artefacts: [],
            columns: [],
            referenceType: {
                'combinations': 'getCombs',
                'images': 'getImgOfComb',
                'columns': 'getColOfComb',
                'artefacts': 'getArtOfImage',
            },
            selectedCombination: this.initialCombination,
            selectedImage: this.initialImage,
        }
    },
    created() {
        this.populateList('combinations')
    },
    methods: {
        populateList(dropdown) {
            let request = {
                transaction: this.referenceType[dropdown],
                version_id: this.selectedCombination,
            }
            if (dropdown === 'images' || dropdown === 'columns') {
                request.combID = this.selectedCombination
            } else if (dropdown === 'artefacts') {
                request.image_id = this.selectedImage
            }

            this.$post('resources/cgi-bin/scrollery-cgi.pl', request)
            .then(res => {
                if (res.status === 200 && res.data) {
                    switch(dropdown) {
                        case 'combinations':
                            this.combinations = undefined
                            this.combinations = res.data.results
                            break
                        case 'images':
                            this.images = undefined
                            this.images = res.data.results
                            break
                        case 'columns':
                            this.columns = undefined
                            this.columns = res.data.results
                            break
                        case 'artefacts':
                            this.artefacts = undefined
                            this.artefacts = res.data.results
                            break
                    }
                }
            })
            .catch(console.error)
        },
    },
    watch: {
        selectedCombination(to, from) {
            if (to !== from) {
                if (this.addType === 'images' || this.addType === 'artefacts') {
                    this.populateList('images')
                } else {
                    this.populateList('columns')
                }
            }
        },
        selectedImage(to, from) {
            if (this.addType === 'artefacts') {
                console.log(`Selected image is: ${to}`)
                this.populateList('artefacts')
            } else {
                //just view the image
            }
        },
    }
}
</script>