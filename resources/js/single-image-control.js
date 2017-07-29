var SingleImageController = (function () {

    // Constructor
    function SingleImageController ($cont, idx) {
		this.info = "stuff";
		var current_images = {};
		var notes = "other things";
		var $full_screen = $('<img>')
			.attr("src", "resources/images/Fullscreen.png")
			.attr("alt", "Full Screen")
			.attr("height", "15")
			.click(function(event){fullScreenToggle(event);});
		var $image_control = $('<button></button>')
			.attr("id", "image-control")
			.attr("type", "button")
			.html("=")
			.click(function(){toggle_image_control();});
		var $zoom_out = $('<button></button>')
			.attr("id", "main-zoom-out")
			.attr("type", "button")
			.html("-");
		var $zoom_in = $('<button></button>')
			.attr("id", "main-zoom-in")
			.attr("type", "button")
			.html("+");
		var $pane_menu = $('<div></div>')
			.addClass("pane-menu")
			.append($image_control)
			.append($zoom_out)
			.append($zoom_in)
			.append($full_screen);
		var pane = $('<div></div>')
			.attr("id", "single-image-pane")
			.addClass("main-pane");
		var control = $('<div></div>')
			.attr("id", "single-image-control");
		var $container = $cont;
		$container.append(pane)
			.append(control)
			.append($pane_menu);
		var that = this;

		// Private functions, will be invoked by name.call(this, ...input vars)
		function load_images(id_type, id){
			$(pane).empty();
			$(control).empty();
			var image_data = new FormData();
			image_data.append('transaction', 'imagesOfFragment');
			image_data.append('idType', id_type);
			image_data.append('id', id);
			jQuery.ajax({
				url: 'resources/cgi-bin/GetImageData.pl',
				context: this,
				data: image_data,
				cache: false,
				contentType: false,
				processData: false,
				type: 'POST',
				success: function(selected_images){
					selected_images['results'].forEach(function(entry) {
						var image_type = entry['wavelength'];
						var filename = entry['filename'];

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
						slider.setAttribute("oninput", "single_image_" + idx + ".setOpacity(this.value, \"" + filename + "\")");
						
						var visible = document.createElement("td");
						var eye = document.createElement("img");
						//eye.setAttribute("id", "eye-" + entry['filename']);
						eye.setAttribute("src", "resources/images/eye-closed.png");
						eye.setAttribute("alt", "not visible");
						eye.dataset.url = entry['url'];
						eye.setAttribute("width", "20");
						eye.setAttribute("height", "20");
						eye.setAttribute("onclick",  "single_image_" + idx + ".toggle_image(\"" + filename + "\", this);");
						
						var mask = document.createElement("td");
						mask.setAttribute("onclick", "mask(" + filename + ");");
						mask.innerHTML = "Mask";
						
						row.appendChild(type);
						row.appendChild(opacity);
						row.appendChild(visible);
						opacity.appendChild(slider);
						visible.appendChild(eye);
						row.appendChild(mask);
						
						$(control).append(row);

						if (entry['is_master'] == 1) {
							$(control).prepend(row);
							this.toggle_image(filename, eye);
						}
					}, this);
				}
			});
		}

		function toggle_image_control() {
			if ($(control).css("visibility") == "visible"){
				$(control).css("visibility", "hidden");
			} else {
				$(control).css("visibility", "visible");
			}
		}

		function display_image(file, url){
			var $new_image = $(document.createElement('div')).attr('id', 'single_image-' + file);
			$($new_image).attr('class', 'single-image-view');
			$(pane).append($new_image);
			var infoJsonUrl = url + file + '/info.json';
			var data = new FormData();
			data.append('user', Spider.user);
			$.ajax({
				data: data,
				cache: false,
				contentType: false,
				processData: false,
				crossDomain: true,
        		type: 'POST',
				dataType: "json",
				url: infoJsonUrl
			}).done(function (infoJson, status, jqXHR) {
				if (infoJson["@id"].includes("134.76.19.179")){
					infoJson["@id"] = infoJson["@id"].replace("cgi-bin/iipsrv.fcgi?", "bronson/Scrollery-dev/cgi-bin/get_web.pl?user=" + Spider.user + "&");
				}
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

		//Public methods are created via the prototype
		SingleImageController.prototype.display_fragment = function (id_type, id) {
			return load_images.call(this, id_type, id);
		}
		SingleImageController.prototype.setOpacity = function(value, filename) {
			$('#single_image-' + $.escapeSelector(filename)).css("opacity", value / 100);
		}
		SingleImageController.prototype.toggle_image = function(file, eye_icon){
			if ($('#single_image-' + $.escapeSelector(file)).length == 0){
				display_image(file, eye_icon.dataset.url);
				eye_icon.setAttribute("src", "resources/images/eye-open.png");
				eye_icon.setAttribute("alt", "visible");
			} else {
				if ($('#single_image-' + $.escapeSelector(file)).css("visibility") == "visible"){
					$('#single_image-' + $.escapeSelector(file)).css("visibility", "hidden");
					eye_icon.setAttribute("src", "resources/images/eye-closed.png");
					eye_icon.setAttribute("alt", "not visible");
				} else {
					$('#single_image-' + $.escapeSelector(file)).css("visibility", "visible");
					eye_icon.setAttribute("src", "resources/images/eye-open.png");
					eye_icon.setAttribute("alt", "visible");
				}
			}
		}
	}
    return SingleImageController;
})();