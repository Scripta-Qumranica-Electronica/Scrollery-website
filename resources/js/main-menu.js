var listing_type = {'lv_1': 'composition',
                    'lv_2': 'edition_location_1',
                    'lv_3': 'edition_location_2',
                    'ref': 'edition_catalog_id'
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
    populate_combinations()
    populate_fragments();
}

function show_item(item){
    $(".collapsible").next().css("visibility", "hidden");
    $(".collapsible").next().css("max-height", "0vh");
    $(item).next().css("max-height", "25vh");
    $(item).next().css("visibility", "visible");
}

function toggle_image_control() {
    if ($("#single-image-control").css("visibility") == "visible"){
        $("#single-image-control").css("visibility", "hidden");
    } else {
        $("#single-image-control").css("visibility", "visible");
    }
}

function populate_combinations() {
    $('#default-combination-listings').on('changed.jstree', function (e, data) {
        if (data.selected[0].startsWith('lvl_3-')) {
            var selected_frag = data.selected[0].split('lvl_3-')[1];
            var data_form = new FormData();
            data_form.append('transaction', 'getColOfScrollID');
            data_form.append('discCanRef', selected_frag);
            get_database_data(data_form, function(results){
                var default_comps = document.getElementById("default-combinations");
                results['results'].forEach(function(result) {
                    load_text(result.scroll_name, result.col_name);
                });
            });
            data_form = new FormData();
            data_form.append('transaction', 'getIAAEdID');
            data_form.append('discCanRef', selected_frag);
            get_database_data(data_form, function(results){
                var default_comps = document.getElementById("default-combinations");
                results['results'].forEach(function(result) {
                    load_images('composition', result.edition_id);
                });
            });
        }
    }).jstree({
        "core" : {
            "themes":{
                "icons":false
            },
		    "data" : {
		        'url' : function(node) {
		            return'resources/cgi-bin/GetImageData.pl';
		        },
		        'type' : 'POST',
		        'data' : function(node) {
                    var trans_data;
                    // var transaction_lvl;
                    if (node.id === "#") {
                        trans_data = {'transaction' : 'getCombs'};
                        current_lvl = 0;
                    }
                    else if (node.id.startsWith('lvl_1-')) {
                        var combination = node.id.split('lvl_1-')[1];
                        trans_data = {'transaction' : 'getColOfComb', 'combID' : combination};
                        current_lvl = 1;
                    }
                    else if (node.id.startsWith('lvl_2-')) {
                        var column = node.id.split('lvl_2-')[1];
                        trans_data = {'transaction' : 'getFragsOfCol', 'colID' : column};
                        current_lvl = 2;
                    }
		            return trans_data;
		 	    },
                'dataFilter' : function(data) {
                    var entries = JSON.parse(data);
                    var menu_list = [];
                    for (var i = 0; i < entries['results'].length; i++){
                        if (current_lvl == 0){
                            var listing = {"text": entries['results'][i]["name"], "id" : 'lvl_1-' + entries['results'][i]["scroll_id"], "children" : true};
                            menu_list.push(listing);
                        }
                        else if (current_lvl == 1){
                            var listing = {"text": entries['results'][i]["name"], "id" : 'lvl_2-' + entries['results'][i]["column_of_scroll_id"], "children" : true};
                            menu_list.push(listing);
                        }
                        else if (current_lvl == 2){
                            var listing_text = entries['results'][i]["column_name"] + entries['results'][i]["fragment_name"] + entries['results'][i]["sub_fragment_name"] + " " + toRoman(parseInt(entries['results'][i]["fragment_column"]));
                            var listing = {"text": listing_text, "id" : 'lvl_3-' + entries['results'][i]["discrete_canonical_reference_id"], "children" : false};
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
    if (data.selected[0].startsWith('lvl_3-')) {
        load_images(listing_type.lv_1, data.selected[0].split('lvl_3-')[1]);
    }
  }).jstree({
        "core" : {
            "themes":{
                "icons":false
            },
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
                            var listing = {"text": entries['results'][i][listing_type.lv_3], "id" : 'lvl_3-' + entries['results'][i][listing_type.ref], "children" : false};
                            menu_list.push(listing);
                        }
                    }
		            return JSON.stringify(menu_list);
		  		}
		  	}
	    }
    });
}

function load_text(scroll, fragment){
    var data_form = new FormData();
    data_form.append('USER_NAME', 'sqe_api');
    data_form.append('PASSWORD', '512JE8ehM3UW');
    data_form.append('SCROLL', scroll);
    data_form.append('FRAGMENT', fragment);
    data_form.append('FORMAT', 'QWB_HTML');
    // get_database_data(data_form, function(response){
    //     $("#signs-pane").html(response.VALUE);
    // });
    jQuery.ajax({
        url: 'https://134.76.19.179/sqe_api/run_api.cgi',
        data: data_form,
        cache: false,
        contentType: false,
        processData: false,
        type: 'POST',
        success: function(response){
            $("#signs-pane").html(response.VALUE);
        },
        error: function(){
            alert("Error retrieving data from database.");
        }
    });
}

function get_database_data(data_form, callback) {
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
  return result;
}