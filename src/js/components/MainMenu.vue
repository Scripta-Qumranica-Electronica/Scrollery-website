<template>
  <div id="main-menu" class='top-level'>
    <div >
        <span>{{ $i18n.str("Combinations") }}</span><button id="new-combination" type="button">add new</button>
        <input v-model="queryString">
        <ul class="combination-menu" placeholder="Search for scroll">
            <li v-for="combination in filterCombinations" :key="combination.version_id">
              <combinaton-menu-item
                @artifact-selected="onArtifactSelected"
                :count="combination.count"
                :name="combination.name"
                :scrollDataID="combination.scroll_data_id"
                :scrollID="combination.scroll_id"
                :version="combination.version"
                :versionID="combination.version_id"
              />
            </li>
        </ul>
    </div>
    <!-- <div class="accordion-panel">
        <div class="accordion-title">
          Combinations
          <button id="new-combination" type="button">add new</button>
        </div>
        <div id="combinations" class="accordion-content">
          <div id="user-combinations" class="main-menu-listing">
            <span>&emsp;-User combinations</span>
            <div id="user-combination-listings"></div>
          </div>
          <div id="default-combinations" class="main-menu-listing">
            <span>&emsp;-Default combinations</span>
            <div id="default-combination-listings"></div>
          </div>
        </div>
    </div>
    <div class="accordion-panel">
        <div class="accordion-title collapsible">Fragments and Artefacts</div>
        <div id="fragments" class="accordion-content">
          <div id="unused-fragments-listing" class="main-menu-listing"></div>
        </div>
    </div> -->
    <!-- <div class="accordion-panel">
        <div class="accordion-title collapsible">GUI</div>
        <div id="gui" class="accordion-content">
          <li><input type="checkbox" id="single-image-button" class="pane-button" reference="single-image-container">Single-Image</input></li>
          <li><input type="checkbox" id="signs-button" class="pane-button" reference="signs-container">Sign</input></li>
          <li><input type="checkbox" id="combination-button" class="pane-button" reference="combination-container">Combination</input></li>
        </div>
    </div> -->
  </div>
</template>

<script>

function legacy() {
  var listing_type = window.listing_type = {'lv_1': 'institution',
      'lv_2': 'catalog_plate',
      'lv_3': 'catalog_fragment',
      'ref': 'image_catalog_id'
  };
  var current_lvel = window.current_lvl = null;

  window.login = function login(){
      $(".collapsible").click(function(){show_item(this);});
      $("#new-combination").css("visibility", "visible");
      $(".accordion-title").css("visibility", "visible");
      $("#combinations").css({
          "visibility": "visible",
          "max-height": "50vh",
          "height": "50vh"
      });
      $("#main-menu").on("click", "#new-combination", new_combination);
      $("#main-menu").on("click", ".clone_combination", function(){
          var $parent = $(this).prev().prev().prev();
          const data_form = new FormData();
          data_form.append('transaction', 'copyCombination');
          data_form.append('SESSION_ID', Spider.session_id);
          data_form.append('scroll_id', $parent.data("id"));
          data_form.append('scroll_version_id', $parent.data("scroll-version"));
          get_database_data(data_form, function(result){
              $('#user-combination-listings').jstree(true).refresh();
          });
      });
      $("#main-menu").on("click", ".scroll_select", loadMenuScroll.bind(this));
      $("#main-menu").on("click", ".fragment_select", function(){
          var scroll = $(this).parents("[id^=lvl_1]:first").find(".scroll_select:first");
          Spider.current_version = $(scroll).data("version");
          Spider.current_version_id = $(scroll).data("scroll-version");
          load_fragment_text($(this).data("id"));
          load_fragment_image($(this).data("id"));
          loadMenuScroll(scroll);
      });
      $("#main-menu").on("click", ".add_artefact", function(){
          add_art_to_comb($(this).prev().html());
      });
      $("#main-menu").on("dblclick", ".editable_name", function(){
          var $this = $(this);
          $this.hide().next().val($this.text()).show().focus().select();
      });
      $("#main-menu").on("blur", ".edited_name", function(){
          var $this = $(this);
          $this.hide().prev().text($this.val()).show();
          rename_combination($this.prev());
      });
      
      // Init menus
      populate_combinations(0); //Default user is 0
      populate_combinations(Spider.user_id);
      populate_fragments();
  }

  window.show_item = function show_item(item){
      $(".collapsible").next().css({
        "visibility": "hidden",
        "max-height": "0vh"
      });
      $(item).next().css({
        "max-height": "25vh",
        "visibility": "visible"
      });
  }

  window.loadMenuScroll = function loadMenuScroll(item) {
      var $scroll = $(item);
      if (Spider.current_combination != $scroll.data("id") || Spider.current_version_id != $scroll.data("scroll-version")) {
          Spider.unlocked = $scroll.data("user") == "default" ? false : true;
          Spider.current_combination = $scroll.data("id");
          Spider.current_version = $scroll.data("version");
          Spider.current_version_id = $scroll.data("scroll-version");
          Spider.propagate_command('load_scroll', {id: $scroll.data("id"), scroll_version: $scroll.data("scroll-version")});
      }
  }

  window.load_fragment_text = function load_fragment_text(selected_frag) {
      Spider.requestFromServer({
              'request': 'loadFragmentText',
              'discreteCanonicalReferenceId': selected_frag, // result.col
              'SCROLLVERSION': Spider.current_version_id
          },
          function(data) {
              if (data == 0) {
                  return;
              }

              Spider.propagate_command('load_text', {data: data});
          }
      );
  }

  window.load_fragment_image = function load_fragment_image(selected_frag){
      const data_form = new FormData();
      data_form.append('transaction', 'getIAAEdID');
      data_form.append('discCanRef', selected_frag);
      get_database_data(data_form, function(results){
          results['results'].forEach(function(result) {
              Spider.propagate_command('load_fragment', {id_type: 'composition', id: result.edition_id});
          });
      });
  }

  window.new_combination = function new_combination(){
      const data_form = new FormData();
      data_form.append('transaction', 'newCombination');
      data_form.append("SESSION_ID", Spider.session_id);
      var d = new Date();
      data_form.append("name", "Scroll-" + d.getTime());
      get_database_data(data_form, function(result){
          Spider.current_combination = result.created.scroll_version;
          console.log("New scroll " + result.created.scroll_version);
          populate_combinations(Spider.user_id);
          $('#user-combination-listings').jstree(true).refresh();
      });
  }

  window.rename_combination = function rename_combination(comb){
      data_form = new FormData();
      data_form.append('transaction', 'nameCombination');
      data_form.append("SESSION_ID", Spider.session_id);
      data_form.append('scroll_id', $(comb).data("id"));
      data_form.append('scroll_data_id', $(comb).data("scroll-data-id"));
      data_form.append('version_id', $(comb).data("scroll-version"));
      data_form.append('name', $(comb).text());
      get_database_data(data_form, function(result){
          $(comb).data("id", result.returned_info);
      });
  }

  window.add_art_to_comb = function add_art_to_comb(art){
      if (Spider.current_combination){
          data_form = new FormData();
          data_form.append('transaction', 'addArtToComb');
          data_form.append("SESSION_ID", Spider.session_id);
          data_form.append('scroll_id', Spider.current_combination);
          data_form.append('version', Spider.current_version);
          data_form.append('version_id', Spider.current_version_id);
          data_form.append('art_id', art);
          get_database_data(data_form, function(result){
              console.log(result.returned_info);
              $('#user-combination-listings').jstree(true).refresh(); 
          });
      }
  }

  window.get_database_data = function get_database_data(data_form, callback) {
    data_form.append('SESSION_ID', Spider['session_id']);
      jQuery.ajax({
          url: 'resources/cgi-bin/GetImageData.pl',
          data: data_form,
          cache: false,
          contentType: false,
          processData: false,
          type: 'POST',
          success: callback,
          error: function(){
              alert("Error retrieving data from database.");
          }
      });
  }

  window.toRoman = function toRoman(num) {  
    var result = '';
    var decimal = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    var roman = ["M", "CM","D","CD","C", "XC", "L", "XL", "X","IX","V","IV","I"];
    for (var i = 0;i<=decimal.length;i++) {
    // looping over every element of our arrays
      while (num%decimal[i] < num) {   
      // keep trying the same number until it won't fit anymore      
        result += roman[i];
        // add the matching roman number to our result string
        num -= decimal[i];
        // remove the decimal value of the roman number from our number
      }
    }
    return result.toLowerCase();
  }
}

import { mapGetters } from 'vuex'
import CombinationMenuItem from './CombinationMenuItem.vue'

export default {
  components: {
    'combinaton-menu-item': CombinationMenuItem
  },
  computed: {
    ...mapGetters(['userID', 'sessionID']),
    filterCombinations() {
        return this.queryString.length 
            ?   this.combinations.filter((combination) => {
                    return combination.name.toLowerCase().indexOf(this.queryString.toLowerCase()) != -1
                })
            : this.combinations
    }
  },
  data() {
    return {
      combinations: [],
      queryString: ''
    }
  },
  methods: {
    onArtifactSelected(args) {
      console.log(args)
    }
  },
  mounted() {

    // run legacy behavior when vue component mounts
    legacy()

    if (this.$store.getters.sessionID && this.$store.getters.userID > -1) {
      this.$post('resources/cgi-bin/GetImageData.pl', {
        transaction: 'getCombs',
        user: this.$store.getters.userID,
        SESSION_ID: this.$store.getters.sessionID
      })
      .then(res => {
        if (res.status === 200 && res.data) {
          this.combinations = res.data.results
        }
      })
      .catch(console.log)
    }
  }
}

</script>

<style lang="sass" scoped>

.combination-menu {
  margin: 0;
  padding: 0 10px;
  height: 70vh;
  min-height: 70vh;
  overflow: auto;
}

.combination-menu li {
  display: block;
}

</style>