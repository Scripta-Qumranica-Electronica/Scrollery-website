var login = function(){
    $(".collapsible").click(function(){show_item(this);});
    $("#new-combination").css("visibility", "visible");
    $(".accordion-title").css("visibility", "visible");
    $("#login").css("max-height", "0vh");
    $("#login").css("visibility", "hidden");
    $("#login-title").html("Logged in as: " + $("input[name=\"username\"]").val());
    $("#combinations").css("max-height", "50vh");
    $("#combinations").css("height", "50vh");
    $("#combinations").css("visibility", "visible");

    populate_fragments();
}

var show_item = function(item){
    $(".collapsible").next().css("visibility", "hidden");
    $(".collapsible").next().css("max-height", "0vh");
    $(item).next().css("max-height", "25vh");
    $(item).next().css("visibility", "visible");
}

function toggle_image_control(){
    if ($("#single-image-control").css("visibility") == "visible"){
        $("#single-image-control").css("visibility", "hidden");
    } else {
        $("#single-image-control").css("visibility", "visible");
    }
}

var listing_type = {'lv_1': 'composition',
                    'lv_2': 'edition_location_1',
                    'lv_3': 'edition_location_2',
                    'ref': 'edition_catalog_id'
                };
var current_lvl;

var populate_fragments = function () {
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