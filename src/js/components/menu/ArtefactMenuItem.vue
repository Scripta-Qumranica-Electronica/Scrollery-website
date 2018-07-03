<template>
  <div>
    <span class="clickable-menu-item" @click="setRouter" :style="{background: $route.params.artID === artefact.artefact_id ? 'lightblue' : '#dedede'}">
      <span v-show="!nameInput">{{artefact.name}}</span>
      <el-input 
        class="artefact-name-change"
        v-show="nameInput" 
        placeholder="Label" 
        v-model="nameInput"
        size="mini"
        @blur="setName"
        @keyup.enter.native="setName"></el-input>
      <i class="fa fa-edit" @click="startNameChange"></i>
      <i v-if="!corpus.combinations.get(scrollVersionID).locked" class="fa fa-trash-o" @click="corpus.artefacts.removeItem(artefact.artefact_id, scrollVersionID)"></i>
    </span>
  </div>
</template>

<script>
export default {
  props: {
    artefact: undefined,
    scrollID: undefined,
    scrollVersionID: undefined,
    imageID: undefined,
    corpus: undefined,
  },
  data() {
    return {
      nameInput: undefined,
    }
  },
  methods: {
    setRouter() {
      const params = this.$route.params
      if (
        params.scrollID !== this.scrollID ||
        params.scrollVersionID !== this.scrollVersionID ||
        params.imageID !== this.imageID ||
        params.artID !== this.artefact.artefact_id
      ) {
        this.$router.push({
          name: 'workbenchAddress',
          params: {
            scrollID: this.scrollID,
            scrollVersionID: this.scrollVersionID,
            colID: params.colID,
            imageID: this.imageID,
            artID: this.artefact.artefact_id,
          },
        })
      }
      // We should tell our corpus object to try fetching the artefact every
      // time it is clicked in the menu.  The object should eventually have a hash
      // associated with it, and should be prepared to recieve a message back
      // saying "nothing changed" and it can leave the artefact alone.
    },
    startNameChange() {
      this.nameInput = this.artefact.name
    },
    setName() {
      if (this.nameInput) {
        this.$store.commit('addWorking')
        this.corpus.artefacts
          .updateName(this.artefact.artefact_id, this.nameInput, this.scrollVersionID)
          .then(res => {
            this.$store.commit('delWorking')
            this.nameInput = undefined
          })
          .catch(err => {
            this.$store.commit('delWorking')
            console.error(err)
          })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.artefact-name-change {
  width: 100px;
}
</style>
