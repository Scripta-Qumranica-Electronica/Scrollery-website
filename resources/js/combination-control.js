var CombinationController = (function () {

    // Constructor
    function CombinationController ($cont, idx) {
		// var $full_screen = $('<img>')
		// 	.attr("src", "resources/images/Fullscreen.png")
		// 	.attr("alt", "Full Screen")
		// 	.attr("height", "15")
		// 	.click(function(event){fullScreenToggle(event);});
		
		// var pane = $('<div></div>')
		// 	.attr("id", "single-image-pane")
		// 	.addClass("main-pane");
		// var control = $('<div></div>')
        // 	.attr("id", "single-image-control");
        var pane = document.getElementById('combination-pane');
        var $container = $cont;
		// $container.append(pane)
		// 	.append(control)
		// 	.append($pane_menu);
		var that = this;

		// Private functions, will be invoked by name.call(this, ...input vars)
		function load_scroll(id){
			$(pane).empty();
			var scroll_data = new FormData();
			scroll_data.append('transaction', 'getScrollArtefacts');
			scroll_data.append('scroll_id', id);
			jQuery.ajax({
				url: 'resources/cgi-bin/GetImageData.pl',
				context: this,
				data: scroll_data,
				cache: false,
				contentType: false,
				processData: false,
				type: 'POST',
				success: function(selected_artefacts){
					selected_artefacts['results'].forEach(function(artefact) {
						var data = artefact['poly'];
                        var polygons = data.split("\),\(");
                        // var rect = JSON.parse(artefact.rect).coordinates;
                        // var img_x = rect[0][0][0];
                        // var img_y = rect[0][0][1];
                        // var img_width = rect[0][2][0] - img_x;
                        // var img_height = rect[0][2][1] - img_y;
                        var rect = artefact.rect;
                        rect = rect.replace('POLYGON((', '');
                        var coords = rect.split(',');
                        var img_x = coords[0].split(' ')[0];
                        var img_y = coords[0].split(' ')[1];
                        var img_width = coords[2].split(' ')[0] - img_x;
                        var img_height = coords[2].split(' ')[1] - img_y;
                        var new_polygons = '';
                        polygons.forEach(function(polygon, index) {
                            new_polygons += 'M';
                            polygon = polygon.replace(/POLYGON/g, "");
                            polygon = polygon.replace(/\(/g, "");
                            polygon = polygon.replace(/\)/g, "");
                            var points = polygon.split(",");
                            points.forEach(function(point) {
                                if (new_polygons.slice(-1) !== 'M'){
                                    new_polygons += 'L';
                                }
                                new_polygons += (point.split(' ')[0] - img_x) + ' ' + (point.split(' ')[1] - img_y);
                            }, this);
                        }, this);

                        var image = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                        image.setAttribute('id', 'SVG-' + artefact['id']);
                        image.setAttribute('class', 'fragment');
                        image.setAttribute('pointer-events', 'none');
                        image.setAttribute('draggable', 'false');
                        
                        var pathDefs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
                        path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                        path.setAttribute('id', 'Path-' + artefact['id']);
                        
                        var clipPathDefs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
                        clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
                        clipPath.setAttribute('id', 'Clip-' + artefact['id']);
                        var clipPathPath = document.createElementNS("http://www.w3.org/2000/svg", "use");
                        clipPathPath.setAttribute('stroke', 'none');
                        clipPathPath.setAttribute('fill', 'black');
                        clipPathPath.setAttribute('fill-rule', 'evenodd');
                        clipPathPath.setAttributeNS("http://www.w3.org/1999/xlink", 'xlink:href', '#Path-' + artefact['id']);
                        
                        var imgContainer = document.createElementNS("http://www.w3.org/2000/svg", "g");
                        imgContainer.setAttribute('id', 'Container-' + artefact['id']);
                        imgContainer.setAttribute('clip-path', 'url(#' + 'Clip-' + artefact['id'] + ')');
                        imgContainer.setAttribute('pointer-events', 'visiblePainted');
                        var svgImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
                        svgImage.setAttribute('id', 'ClippedImg-' + artefact['id']);
                        svgImage.setAttribute('class', 'clippedImg');
                        svgImage.setAttribute('draggable', 'false');
                        
                        var outline = document.createElementNS("http://www.w3.org/2000/svg", "use");
                        outline.setAttribute('stroke', 'blue');
                        outline.setAttribute('stroke-width', '3');
                        outline.setAttribute('fill', 'none');
                        outline.setAttribute('fill-rule', 'evenodd');
                        outline.setAttribute('id', 'fragOutline-' + artefact['id']);
                        outline.setAttribute('class', 'fragOutline');
                        outline.setAttributeNS("http://www.w3.org/1999/xlink", 'xlink:href', '#Path-' + artefact['id']);
                        
                        pathDefs.appendChild(path);
                        clipPath.appendChild(clipPathPath);
                        clipPathDefs.appendChild(clipPath);
                        imgContainer.appendChild(svgImage);
                        image.appendChild(pathDefs);
                        image.appendChild(clipPathDefs);
                        image.appendChild(imgContainer);
                        image.appendChild(outline);

                        var scale = 0.4;
                        path.setAttribute('d', new_polygons);
                        path.setAttribute('transform', 'scale(' + scale + ')');
                        var file_name = artefact['filename'];
                        var file_extension = "";
                        if (file_name.includes("134.76.19.179")) {
                            file_extension = "default.jpg&user=test";
                        } else if (file_name.includes("gallica")) {
                            file_extension = "native.jpg";
                        }
                        svgImage.setAttributeNS("http://www.w3.org/1999/xlink", 'xlink:href', artefact['url'] + file_name + '/' + img_x + ',' + img_y + ',' + img_width + ',' + img_height + '/pct:' + (scale * 100) + '/0/' + file_extension + 'native.jpg');
                        svgImage.setAttribute('width', img_width * scale);
                        svgImage.setAttribute('height', img_height * scale);
                        image.setAttribute('width', img_width * scale);
                        image.setAttribute('height', img_height * scale);

                        pane.appendChild(image);
					}, this);
				}
			});
		}

		//Public methods are created via the prototype
		CombinationController.prototype.display_scroll = function (id) {
			return load_scroll.call(this, id);
		}
		// CombinationController.prototype.setOpacity = function(value, filename) {
		// 	$('#single_image-' + $.escapeSelector(filename)).css("opacity", value / 100);
		// }
		// CombinationController.prototype.toggle_image = function(file, eye_icon){
		// 	if ($('#single_image-' + $.escapeSelector(file)).length == 0){
		// 		display_image(file, eye_icon.dataset.url);
		// 		eye_icon.setAttribute("src", "resources/images/eye-open.png");
		// 		eye_icon.setAttribute("alt", "visible");
		// 	} else {
		// 		if ($('#single_image-' + $.escapeSelector(file)).css("visibility") == "visible"){
		// 			$('#single_image-' + $.escapeSelector(file)).css("visibility", "hidden");
		// 			eye_icon.setAttribute("src", "resources/images/eye-closed.png");
		// 			eye_icon.setAttribute("alt", "not visible");
		// 		} else {
		// 			$('#single_image-' + $.escapeSelector(file)).css("visibility", "visible");
		// 			eye_icon.setAttribute("src", "resources/images/eye-open.png");
		// 			eye_icon.setAttribute("alt", "visible");
		// 		}
		// 	}
		// }
	}
    return CombinationController;
})();