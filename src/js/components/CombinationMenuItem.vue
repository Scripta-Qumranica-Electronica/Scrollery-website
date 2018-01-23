<template>
  <div>
    <span @click="fetchChildren">{{ name }} - {{ username }} - v. {{ version }}</span>
    <div class="children" v-show="showChildren">
        <ul>
          <li v-for="frg in children" :key="frg.col_id" @click="loadArtefact(frg.col_id)">{{ frg.name }} ({{ frg.col_id }})</li>
        </ul>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  props: {
    count: 0,
    name: "",
    scrollDataID: 0,
    scrollID: 0,
    version: 0,
    versionID: 0
  },
  data() {
    return {
      children: [],
      showChildren: false
    }
  },
  computed: {
    ...mapGetters(['username', 'sessionID', 'userID'])
  },
  methods: {
    fetchChildren() {

      // we'll lazy load children, but cache tehm
      if (this.children.length) {

        // toggle show children
        this.showChildren = !this.showChildren
        return
      }

      this.$post('resources/cgi-bin/GetImageData.pl', {
        transaction: 'getColOfComb',
        combID: this.scrollDataID,
        user: this.userID,
        version_id: this.versionID,
        SESSION_ID: this.sessionID
      })
      .then(res => {
        if (res.status === 200 && res.data) {
          this.children = res.data.results
          this.showChildren = true
        }
      })
      .catch(console.error)
    },

    loadArtefact(colID) {
      // var scroll = $(this).parents("[id^=lvl_1]:first").find(".scroll_select:first");
      // Spider.current_version = $(scroll).data("version");
      // Spider.current_version_id = $(scroll).data("scroll-version");
      // load_fragment_text($(this).data("id"));
      // load_fragment_image($(this).data("id"));

      this.$post('resources/cgi-bin/GetImageData.pl', {
        transaction: 'getFragsOfCol',
        colID: colID,
        user: this.$store.getters.userID,
        version: undefined,
        SESSION_ID: this.$store.getters.sessionID
      })
      .then(res => {
        if (res.data && res.data.results) {
          const col = res.data.results[0]

          // Emit event up with all relevant information
          this.$emit('artifact-selected', {
            version: this.version,
            versionID: this.versionID, // = current_version_id
            scrollDataID: this.scrollDataID,
            scrollID: this.scrollID,
            id: col["discrete_canonical_reference_id"]
          })
        }
      })
      .catch(res => {
        alert("Unable to load artefact.")
        console.error(res)
      })
    }
  }
}
</script>