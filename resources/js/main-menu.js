var listing_type = {'lv_1': 'institution',
                    'lv_2': 'catalog_plate',
                    'lv_3': 'catalog_fragment',
                    'ref': 'image_catalog_id'
                };
var current_lvl;

function login(){
    $(".collapsible").click(function(){show_item(this);});
    $("#new-combination").css("visibility", "visible");
    $(".accordion-title").css("visibility", "visible");
    $("#login-menu").css("max-height", "0vh");
    $("#login-menu").css("visibility", "hidden");
    $("#login-title").html("Logged in as: " + Spider.user);
    $("#combinations").css("max-height", "50vh");
    $("#combinations").css("height", "50vh");
    $("#combinations").css("visibility", "visible");
    $("#main-menu").on("click", ".clone_combination", function(){
        data_form = new FormData();
        data_form.append('transaction', 'copyCombination');
        data_form.append('SESSION_ID', Spider.session_id);
        data_form.append('scroll_id', $(this).prev().prev().prev().data("id"));
        data_form.append('scroll_version_id', $(this).prev().prev().prev().data("scroll-version"));
        get_database_data(data_form, function(result){
            $('#user-combination-listings').jstree(true).refresh();
            tree.refresh();
        });
    });
    $("#main-menu").on("click", ".scroll_select", function(){
        if (Spider.current_combination != $(this).data("id") || Spider.current_version_id != $(this).data("scroll-version")) {
            Spider.unlocked = $(this).data("user") == "default" ? false : true;
            Spider.current_combination = $(this).data("id");
            Spider.current_version = $(this).data("version");
            Spider.current_version_id = $(this).data("scroll-version");
            Spider.propagate_command('load_scroll', {id: $(this).data("id"), scroll_version: $(this).data("scroll-version")});
        }
    });
    $("#main-menu").on("click", ".fragment_select", function(){
        load_fragment_text($(this).data("id"));
        load_fragment_image($(this).data("id"));
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

function show_item(item){
    $(".collapsible").next().css("visibility", "hidden");
    $(".collapsible").next().css("max-height", "0vh");
    $(item).next().css("max-height", "25vh");
    $(item).next().css("visibility", "visible");
}

function load_fragment_text(selected_frag)
{
    data_form = new FormData();
    data_form.append('transaction', 'getScrollColNameFromDiscCanRef');
    data_form.append('frag_id', selected_frag);
//	const data_form =
//	{
//		'transaction': 'getScrollColNameFromDiscCanRef',
//		'frag_id': selected_frag
//	};

    get_database_data(data_form, function(results){
        results['results'].forEach(function(result) {
            Spider.requestFromServer
            (
                {
                	'request': 'loadFragmentText',
                    'discreteCanonicalReferenceId': selected_frag // result.col
                },
                function(data)
                {
                    if (data == 0)
                    {
                        return;
                    }
                    
                    Spider.notifyChangedText(data);
                },
                function()
                {
                	console.log('loadFragmentText() went wrong');
                }
            );
        });
    });
}

function load_fragment_image(selected_frag){
    data_form = new FormData();
    data_form.append('transaction', 'getIAAEdID');
    data_form.append('discCanRef', selected_frag);
    get_database_data(data_form, function(results){
        results['results'].forEach(function(result) {
            Spider.propagate_command('load_fragment', {id_type: 'composition', id: result.edition_id});
        });
    });
}

function new_combination(){
    data_form = new FormData();
    data_form.append('transaction', 'newCombination');
    data_form.append("SESSION_ID", Spider.session_id);
    var d = new Date();
    data_form.append("name", "Scroll-" + d.getTime());
    get_database_data(data_form, function(result){
        Spider.current_combination = result.created.scroll_version;
        console.log("New scroll " + result.created.scroll_version);
        populate_combinations(Spider.user_id);
    });
}

function rename_combination(comb){
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

function add_art_to_comb(art){
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

function populate_combinations(user) {
    var menu = user == 0 ? '#default-combination-listings' : '#user-combination-listings';
    var username = user == 0 ? "default" : Spider.user;
    $(menu).jstree({
        "core" : {
            "themes":{
                "icons":false
            },
            "html_titles":true,
		    "data" : {
		        'url' : function(node) {
		            return'resources/cgi-bin/GetImageData.pl';
		        },
		        'type' : 'POST',
		        'data' : function(node) {
                    var trans_data;
                    // var transaction_lvl;
                    if (node.id === "#") {
                        trans_data = {'transaction' : 'getCombs', 'user' : user, 'SESSION_ID' : Spider['session_id']};
                        current_lvl = 0;
                    }
                    else if (node.id.startsWith('lvl_1-')) {
                        var combination = node.id.split('-')[1];
                        // var version = node.id.split('-')[3];
                        var version_id = node.id.split('-')[3];
                        console.log(version_id);
                        trans_data = {'transaction' : 'getColOfComb', 'combID' : combination, 'user' : user, 'version_id': version_id, 'SESSION_ID' : Spider['session_id']};
                        current_lvl = 1;
                    }
                    else if (node.id.startsWith('lvl_2-')) {
                        var column = node.id.split('-')[1];
                        var version = node.id.split('-')[2];
                        trans_data = {'transaction' : 'getFragsOfCol', 'colID' : column, 'user' : user, 'version': version, 'SESSION_ID' : Spider['session_id']};
                        current_lvl = 2;
                    }
		            return trans_data;
		 	    },
                'dataFilter' : function(data) {
                    var entries = JSON.parse(data);
                    var menu_list = [];
                    for (var i = 0; i < entries['results'].length; i++){
                        if (current_lvl == 0){
                            var scroll_version_id = username == "default" ? 1 : entries['results'][i]["version_id"];
                            var children = entries['results'][i]["count"] > 0 ? true :false;
                            var listing = {"text": "<span class=\"menu scroll_select editable_name\" data-id=\"" + entries['results'][i]["scroll_id"] + "\" data-version=\"" + entries['results'][i]["version"] + "\" data-user=\"" + username + "\" data-scroll-version=\"" + scroll_version_id + "\" data-scroll-data-id=\"" + entries['results'][i]["scroll_data_id"] + "\">" + entries['results'][i]["name"] + '</span><input type=\"text\" class=\"edited_name\" hidden/><span class=\"menu\"> – ' + username + ' – v. ' + entries['results'][i]["version"] + ' ' + "</span><span class=\"menu clone_combination\">clone</span>", "id" : 'lvl_1-' + entries['results'][i]["scroll_id"] + '-' + entries['results'][i]["name"] + '-' + entries['results'][i]["version_id"], "children" : children, state : {disabled  : true}};
                            menu_list.push(listing);
                        }
                        else if (current_lvl == 1){
                            var children = entries['results'][i]["count"] > 0 ? true :false;
                            var listing = {"text": entries['results'][i]["name"], "id" : 'lvl_2-' + entries['results'][i]["col_id"] + '-' + entries['results'][i]["version"], "children" : children, state : {disabled  : true}};
                            menu_list.push(listing);
                        }
                        else if (current_lvl == 2){
                            var listing_text = entries['results'][i]["column_name"] + entries['results'][i]["fragment_name"] + entries['results'][i]["sub_fragment_name"] + " " + toRoman(parseInt(entries['results'][i]["fragment_column"]));
                            var listing = {"text": "<span class=\"menu fragment_select\" data-id=\"" + entries['results'][i]["discrete_canonical_reference_id"]  + "\" data-version=\"" + entries['results'][i]["version"] + "\" data-col-of-scroll=\"" + entries['results'][i]["column_of_scroll_id"] + "\">" + listing_text + "</span>", "id" : 'lvl_3-' + entries['results'][i]["discrete_canonical_reference_id"], "children" : false};
                            menu_list.push(listing);
                        }
                    }
		            return JSON.stringify(menu_list);
		  		}
		  	}
	    }
    });
}

function populate_fragments() {
    $('#unused-fragments-listing').on('changed.jstree', function (e, data) {
        // if (data.selected[0].startsWith('lvl_3-')) {
        //     console.log( data.selected[0].split('lvl_3-')[1]);
        //     // load_images(listing_type.lv_1, data.selected[0].split('lvl_3-')[1]);
        // }
    }).jstree({
        "core" : {
            "themes":{
                "icons":false
            },
            "html_titles":true,
		    "data" : {
		        'url' : function(node) {
		            return'resources/cgi-bin/GetImageData.pl';
		        },
		        'type' : 'POST',
		        'data' : function(node) {
                    var trans_data;
                    // var transaction_lvl;
                    if (node.id === "#") {
                        if (listing_type['lv_1'] == 'composition'){
                            trans_data = {'transaction' : 'canonicalCompositions'};
                        }
                        if (listing_type['lv_1'] == 'institution'){
                            trans_data = {'transaction' : 'institutions'};
                        }
                        current_lvl = 0;
                    }
                    else if (node.id.startsWith('lvl_1-')) {
                        var arg_2 = node.id.split('lvl_1-')[1];
                        if (listing_type['lv_2'] == 'edition_location_1'){
                            trans_data = {'transaction' : 'canonicalID1', 'composition' : arg_2};
                        }
                        if (listing_type['lv_2'] == 'catalog_plate'){
                            trans_data = {'transaction' : 'institutionPlates', 'institution' : arg_2};
                        }
                        current_lvl = 1;
                    }
                    else if (node.id.startsWith('lvl_2-')) {
                        var ref_data = node.id.split('lvl_2-')[1];
                        var arg_2 = ref_data.split('-')[0];
                        var arg_3 = ref_data.split('-')[1];
                        if (listing_type['lv_3'] == 'edition_location_2'){
                            trans_data = {'transaction' : 'canonicalID2', 'composition' : arg_2, 'edition_location_1' : arg_3};
                        }
                        if (listing_type['lv_3'] == 'catalog_fragment'){
                            trans_data = {'transaction' : 'institutionFragments', 'institution' : arg_2, 'catalog_number_1' : arg_3};
                        }
                        current_lvl = 2;
                    }
                    else if (node.id.startsWith('lvl_3-')) {
                        var ref_data = node.id.split('lvl_3-')[1];
                        var arg_2 = ref_data.split('-')[0];
                        var arg_3 = ref_data.split('-')[1];
                        if (listing_type['lv_3'] == 'edition_location_2'){
                            trans_data = {'transaction' : 'canonicalID2', 'composition' : arg_2, 'edition_location_1' : arg_3};
                        }
                        if (listing_type['lv_3'] == 'catalog_fragment'){
                            trans_data = {'transaction' : 'institutionArtefacts', 'catalog_id' : arg_2, 'user_id' : arg_3};
                        }
                        current_lvl = 3;
                    }
                    trans_data['SESSION_ID'] = Spider['session_id'];
		            return trans_data;
		 	    },
                'dataFilter' : function(data) {
                    var entries = JSON.parse(data);
                    var menu_list = [];
                    for (var i = 0; i < entries['results'].length; i++){
                        if (current_lvl == 0){
                            var listing = {"text": entries['results'][i][listing_type.lv_1], "id" : 'lvl_1-' + entries['results'][i][listing_type.lv_1], "children" : true};
                            menu_list.push(listing);
                        }
                        else if (current_lvl == 1){
                            var listing = {"text": entries['results'][i][listing_type.lv_2], "id" : 'lvl_2-' + entries['results'][i][listing_type.lv_1] + '-' + entries['results'][i][listing_type.lv_2], "children" : true};
                            menu_list.push(listing);
                        }
                        else if (current_lvl == 2){
                            var listing = {"text": entries['results'][i][listing_type.lv_3] + " default", "id" : 'lvl_3-' + entries['results'][i][listing_type.ref] + "-0", "children" : true};
                            menu_list.push(listing);
                            listing = {"text": entries['results'][i][listing_type.lv_3] + " user", "id" : 'lvl_3-' + entries['results'][i][listing_type.ref] + "-" + Spider.user_id, "children" : true};
                            menu_list.push(listing);
                        }
                        else if (current_lvl == 3){
                            var listing = {"text": "<span>" + entries['results'][i]["artefact_id"] + "</span><span class=\"add_artefact\"> +</span>", "id" : 'lvl_4-' + entries['results'][i]["artefact_id"] + "-" + entries['results'][i]["user_id"], "children" : false};
                            menu_list.push(listing);
                        }
                    }
		            return JSON.stringify(menu_list);
		  		}
		  	}
	    }
    });
}

// function load_text(scroll, fragment){
//     var data_form = new FormData();
//     data_form.append('USER_NAME', 'sqe_api');
//     data_form.append('PASSWORD', ''); // PW removed for security
//     data_form.append('SCROLL', scroll);
//     data_form.append('FRAGMENT', fragment.replace("+", "\\+"));
//     data_form.append('FORMAT', 'QWB_HTML');
//     jQuery.ajax({
//         url: 'https://134.76.19.179/sqe_api/run_api.cgi',
//         data: data_form,
//         cache: false,
//         contentType: false,
//         processData: false,
//         type: 'POST',
//         success: function(response){
//             $("#signs-pane").html(response.VALUE);
//         },
//         error: function(){
//             alert("Error retrieving data from database.");
//         }
//     });
// }

function get_database_data(data_form, callback) {
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

function toRoman(num) {  
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
