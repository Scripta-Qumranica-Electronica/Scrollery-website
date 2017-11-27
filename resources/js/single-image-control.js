var SingleImageController = (function () {

    // Constructor
    function SingleImageController ($cont, idx) {
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
			.attr("id", "single-image-control")
			.addClass("list-group")
			.addClass("noselect")
			.css("visibility", "hidden");
		var $container = $cont;
		$container.append(pane)
			.append(control)
			.append($pane_menu);
		var self = this;

		// Private functions, will be invoked by name.call(this, ...input vars)
		function load_images(id_type, id){
			$(pane).empty();
			$(control).empty();
			var image_data = new FormData();
			image_data.append('transaction', 'imagesOfFragment');
			image_data.append('idType', id_type);
			image_data.append('id', id);
			image_data.append('SESSION_ID', Spider.session_id);
			jQuery.ajax({
				url: 'resources/cgi-bin/GetImageData.pl',
				context: this,
				data: image_data,
				cache: false,
				contentType: false,
				processData: false,
				type: 'POST',
				success: function(selected_images){
					selected_images['results'].forEach(function(entry, index) {
						var image_type;
						if (entry.start == entry.end) {
							image_type = entry.start;
						} else {
							image_type = entry.start + '-' + entry.end;
						}
						image_type += 'nm';
						var filename = entry['filename'];
						if (filename.includes('RRIR')) {
							image_type += ' RR';
						} else if (filename.includes('RLIR')) {
							image_type += ' RL';
						}

						var row = document.createElement("tr");
						row.className = "list-group-item";
						row.dataset.filename = filename;

						var handle = document.createElement("span");
						handle.className = "drag-handle";
						handle.innerHTML = '&#9776;';
						
						var type = document.createElement("td");
						type.innerHTML = image_type;
						
						var opacity = document.createElement("td");
						var slider = document.createElement("input");
						slider.setAttribute("type", "range");
						slider.setAttribute("class", "opacity-slider"); 
						slider.setAttribute("value", "100"); 
						slider.setAttribute("min", "0");
						slider.setAttribute("max", "100");
						slider.addEventListener("input", function(){
							setOpacity(this.value, filename);
						});
						
						var visible = document.createElement("td");
						var eye = document.createElement("i");
						eye.classList.add("fa");
						eye.classList.add("fa-eye-slash");
						eye.style.color = "red";
						eye.dataset.url = entry['url'];
						eye.addEventListener("click", function(){
							toggle_image(filename, this);
						});
						
						var mask = document.createElement("td");
						mask.setAttribute("onclick", "mask(" + filename + ");");
						mask.innerHTML = "Mask";
						
						row.appendChild(handle);
						row.appendChild(type);
						row.appendChild(opacity);
						row.appendChild(visible);
						opacity.appendChild(slider);
						visible.appendChild(eye);
						row.appendChild(mask);
						
						$(control).append(row);

						if (entry['is_master'] == 1) {
							$(control).prepend(row);
							toggle_image(filename, eye);
						}

						if (index == (selected_images['results'].length - 1)) {
							Sortable.create(document.getElementById('single-image-control'), 
								{handle: ".drag-handle",
								animation: 150,
								draggable: ".list-group-item",
								onEnd: function (/**Event*/evt) {
									reorder_images();
							}});
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
			$($new_image).data('file', file);
			$(pane).append($new_image);
			reorder_images();
			
			var data = new FormData();
			data.append('user', Spider.user);
			data.append('url', url);
			data.append('file', file + '/info.json');
			$.ajax({
				data: data, //This if method is purely to secure our SQE IIIF server, remove it when we switch to the IAA NLI server
				cache: false,
				contentType: false,
				processData: false,
        		type: 'POST', //This if method is purely to secure our SQE IIIF server, remove it when we switch to the IAA NLI server
				dataType: "json",
				context: this,
				url: "https://www.qumranica.org/cgi-bin/sqe-iiif.pl"
			}).done(function (infoJson, status, jqXHR) {
				//This if method is purely to secure our SQE IIIF server, remove it when we switch to the IAA NLI server
				if (infoJson["@id"].includes("www.qumranica.org")){
					infoJson["@id"] = infoJson["@id"].replace("iipsrv.fcgi?IIIF=", "sqe-iiif.pl?user=" + Spider.user + "&url=" + url + "&file=");
				} else if (infoJson["@id"].includes("gallica")){
					infoJson["@id"] = infoJson["@id"].replace("http://gallica.bnf.fr/iiif/ark%3A%2F", "https://www.qumranica.org/cgi-bin/sqe-iiif.pl?user=" + Spider.user + "&url=" + url + "&file=");
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
					mouseNavEnabled: true,
				});
			});
		}

		function reorder_images() {
			var filelist = [];
			$(control).find("> tr").each(function (index){
				filelist.push(this.dataset.filename);
			});
			filelist.reverse();
			filelist.forEach(function(file){
				$(pane).append($(document.getElementById('single_image-' + file)));
			});
		}

		function setOpacity(value, filename) {
			$('#single_image-' + $.escapeSelector(filename)).css("opacity", value / 100);
		}

		function toggle_image(file, eye_icon){
			if ($('#single_image-' + $.escapeSelector(file)).length == 0){
				display_image.call(this, file, eye_icon.dataset.url);
				eye_icon.classList.remove("fa-eye-slash");
				eye_icon.style.color = "green";
				eye_icon.classList.add("fa-eye");
			} else {
				if ($('#single_image-' + $.escapeSelector(file)).css("visibility") == "visible"){
					$('#single_image-' + $.escapeSelector(file)).css("visibility", "hidden");
					eye_icon.classList.remove("fa-eye");
					eye_icon.style.color = "red";
					eye_icon.classList.add("fa-eye-slash");
				} else {
					$('#single_image-' + $.escapeSelector(file)).css("visibility", "visible");
					eye_icon.classList.remove("fa-eye-slash");
					eye_icon.style.color = "green";
					eye_icon.classList.add("fa-eye");
				}
			}
		}

		//Public methods are created via the prototype
		SingleImageController.prototype.display_fragment = function (data) {
			return load_images.call(this, data.id_type, data.id);
		}

		//register responders with messageSpider
		Spider.register_object([
			{type: 'load_fragment',
				execute_function: function(data){
				self.display_fragment(data);
				},
				name: "SingleImageControl"
			}
		]);
	}
    return SingleImageController;
})();
