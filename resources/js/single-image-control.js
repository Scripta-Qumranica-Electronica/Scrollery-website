function load_images(id_type, id){
	$('#single-image-pane').empty();
	var image_data = new FormData();
	image_data.append('transaction', 'imagesOfFragment');
	image_data.append('idType', id_type);
	image_data.append('id', id);
	jQuery.ajax({
    	url: 'resources/cgi-bin/GetImageData.pl',
    	data: image_data,
    	cache: false,
    	contentType: false,
    	processData: false,
    	type: 'POST',
    	success: function(selected_images){
			selected_images['results'].forEach(function(entry) {
				// $image_listing = $(document.createElement('div'));
				var image_type = entry['filename'].split("-")[7];
				image_type = image_type.split("_")[0];
				var filename = entry['filename'];
				// $image_listing.html(type);
				// $("#single-image-control").append($image_listing);

				var row = document.createElement("tr");
				
				var type = document.createElement("td");
				type.innerHTML = image_type;
				
				var opacity = document.createElement("td");
				var slider = document.createElement("input");
				slider.setAttribute("type", "range");
				slider.setAttribute("class", "opacity-slider"); 
				slider.setAttribute("value", "100"); 
				slider.setAttribute("min", "0");
				slider.setAttribute("max", "100");
				slider.setAttribute("oninput", "setOpacity(this.value, \"" + filename + "\")");
				
				var visible = document.createElement("td");
				var eye = document.createElement("img");
				//eye.setAttribute("id", "eye-" + entry['filename']);
				eye.setAttribute("src", "resources/images/eye-closed.png");
				eye.setAttribute("alt", "not visible");
				eye.setAttribute("width", "20");
				eye.setAttribute("height", "20");
				eye.setAttribute("onclick", "toggle_image(\"" + filename + "\", this);");
				
				var mask = document.createElement("td");
				//mask.setAttribute("id", "mask-" + images.data[i].id);
				mask.setAttribute("onclick", "mask(" + filename + ");");
				mask.innerHTML = "Mask";
				
				row.appendChild(type);
				row.appendChild(opacity);
				row.appendChild(visible);
				opacity.appendChild(slider);
				visible.appendChild(eye);
				row.appendChild(mask);
				
				var table = document.getElementById("single-image-control");
				table.appendChild(row);

				if (entry['is_master'] == 1) {
					toggle_image(filename, eye);
				}
			});
    	}
	});
}

function toggle_image(file, element){
	if ($('#single_image-' + $.escapeSelector(file)).length == 0){
		display_image(file);
		element.setAttribute("src", "resources/images/eye-open.png");
		element.setAttribute("alt", "visible");
	} else {
		if ($('#single_image-' + $.escapeSelector(file)).css("visibility") == "visible"){
			$('#single_image-' + $.escapeSelector(file)).css("visibility", "hidden");
			element.setAttribute("src", "resources/images/eye-closed.png");
			element.setAttribute("alt", "not visible");
		} else {
			$('#single_image-' + $.escapeSelector(file)).css("visibility", "visible");
			element.setAttribute("src", "resources/images/eye-open.png");
			element.setAttribute("alt", "visible");
		}
	}
}

function display_image(file){
	$new_image = $(document.createElement('div')).attr('id', 'single_image-' + file);
	$($new_image).attr('class', 'single-image-view');
	$('#single-image-pane').append($new_image);
	var infoJsonUrl = 'http://134.76.19.179/cgi-bin/iipsrv.fcgi?IIIF=' +file + '/info.json';
	jQuery.getJSON(infoJsonUrl).done(function (infoJson, status, jqXHR) {
		var viewer = OpenSeadragon({
			id: 'single_image-' + file,
			preserveViewport: true,
			visibilityRatio: 1,
			minZoomLevel: 1,
			defaultZoomLevel: 1,
			sequenceMode: false,
			tileSources: infoJson,
			prefixUrl: 'vendors/openseadragon/images/',
			navigationControlAnchor: OpenSeadragon.ControlAnchor.BOTTOM_LEFT,
			showFullPageControl: false,
			showHomeControl: false,
			zoomInButton:   "main-zoom-in",
			zoomOutButton:  "main-zoom-out",
			mouseNavEnabled: false,
		});
	});
}

function setOpacity(value, filename) {
	$('#single_image-' + $.escapeSelector(filename)).css("opacity", value / 100);
}