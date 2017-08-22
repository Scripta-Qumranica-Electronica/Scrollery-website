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
        var $comb_scroll = $('<div></div>');
        $comb_scroll.attr('id','combination-viewport');
        $comb_scroll.css('width', '10000px');
        $comb_scroll.css('height', '500');
        $('#combination-pane').append($comb_scroll);
        var $container = $cont;
		// $container.append(pane)
		// 	.append(control)
		// 	.append($pane_menu);
		var that = this;

		// Private functions, will be invoked by name.call(this, ...input vars)
		function load_scroll(id){
			$comb_scroll.empty();
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

                        var image_cont_xy = document.createElement('div');
                        image_cont_xy.setAttribute('id', 'image-cont-xy-' + artefact['id']);
                        image_cont_xy.setAttribute('class', 'fragment fragment-cont-xy');
                        $(image_cont_xy).css({top: '0px', left: '0px', transform: 'initial'});

                        var image_cont_rotate = document.createElement('div');
                        image_cont_rotate.setAttribute('id', 'image-cont-rotate-' + artefact['id']);
                        image_cont_rotate.setAttribute('class', 'fragment fragment-cont-rot');

                        var image = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                        image.setAttribute('id', 'SVG-' + artefact['id']);
                        
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
                        // svgImage.setAttribute('class', 'clippedImg');
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
                        svgImage.setAttributeNS("http://www.w3.org/1999/xlink", 'xlink:href', "https://134.76.19.179/cgi-bin/sqe-iiif.pl?user=" + Spider.user + "&url=" + artefact.url + "&file="
                          + artefact.filename + '/' + img_x + ',' + img_y + ',' + img_width + ',' + img_height + '/pct:' + (scale * 100) + '/0/' + artefact.suffix);
                        svgImage.setAttribute('class', 'clippedImg');
                        svgImage.setAttribute('width', img_width * scale);
                        svgImage.setAttribute('height', img_height * scale);
                        svgImage.setAttribute('draggable', 'false');
                        image.setAttribute('width', img_width * scale);
                        image.setAttribute('height', img_height * scale);

                        image_cont_rotate.appendChild(image);
                        image_cont_xy.appendChild(image_cont_rotate);
                        $comb_scroll.append($(image_cont_xy));
					}, this);
				}
			});
        }
        
        //Event handling
        $comb_scroll.on('mousedown', mouseDown);
        var mouseOrigin = {x: 0, y: 0};
        var selected_artefact;
        function mouseDown(evt) {
            console.log(evt.target);
            if (evt.target !== evt.currentTarget) {
                if($(evt.target).attr("class") == 'clippedImg'){
            console.log(evt.target);
            console.log($(evt.target).parent().parent().parent().parent());
                    selected_artefact = evt.target;
                    evt.preventDefault();
                    // clickTime = 0;
                    // timer = setInterval(function(){
                    //     clickTime += 1;
                    // }, 10);
                    $comb_scroll.on('mousemove', mouseMove);
                    $comb_scroll.on('mouseup', mouseUp);
                    $comb_scroll.append($(evt.target).parent().parent().parent().parent());
                    mouseOrigin.x = evt.clientX;
                    mouseOrigin.y = evt.clientY;
                    // if(selectedFragDIV != fragDiv[0].id){
                    //     selectedFragDIV = fragDiv[0].id;
                    //     fragOSDVisible = false;
                    // }

                    evt.stopPropagation();
                }
            }
        }

        function mouseMove(evt){
            // if (!mouseMoved){
            //     mouseMoved = true;
            // };
            // if (document.getElementById("rotate-handle")){
            //     document.getElementById("rotate-handle").parentNode.removeChild(document.getElementById("rotate-handle"));
            // }
            // if (document.getElementById("slide-handle")){
            //     document.getElementById("slide-handle").parentNode.removeChild(document.getElementById("slide-handle"));
            // }
            var x = evt.clientX;
            var y = evt.clientY;
            var viewport = {t: $comb_scroll.offsetTop + 10,
                            b: $comb_scroll.offsetTop +  $comb_scroll.clientHeight - 10,
                            l: $comb_scroll.offsetLeft + 10,
                            r: $comb_scroll.offsetLeft + $comb_scroll.clientWidth - 10,
            };
            // switch (true){
            //     case (y < viewport.t):
            //         scroll.scrollTop = parseInt(scroll.scrollTop, 10) - 5;
            //         y += 5;
            //         break;
            //     case (y > viewport.b):
            //         scroll.scrollTop = parseInt(scroll.scrollTop, 10) + 5;
            //         y -= 5;
            //         break;
            //     case (x < viewport.l):
            //         scroll.scrollLeft = parseInt(scroll.scrollLeft, 10) - 5;
            //         x += 5;
            //         break;
            //     case (x > viewport.r):
            //         scroll.scrollLeft = parseInt(scroll.scrollLeft, 10) + 5;
            //         x -= 5;
            //         break;
            // }

            var moveXY = {
                x: x - mouseOrigin.x,
                y: y - mouseOrigin.y,
            };
            $(selected_artefact).parent().parent().parent().parent().css('transform', 'translate3d(' + moveXY.x + 'px, ' + moveXY.y + 'px, 0px)');
        }

        function mouseUp(evt) {
            evt.preventDefault();
            // if(clickTime > 25){
            //     click = false;
            //     window.clearInterval(timer);
            // }
            $comb_scroll.off('mousemove', mouseMove);
            $comb_scroll.off('mouseup', mouseUp);
            // if(!click){
            //     if(mouseMoved){
            //         saveMove(evt);
            //     }
            //     click = true;
            // } else {
            //     window.clearInterval(timer);
            //     if(fragOSDVisible){
            //         hideFragOSD();
            //         fragOSDVisible = false;
            //     } else {
            //         showFragOSD(selectedFragDIV.split("DIV-")[1]);
            //         fragOSDVisible = true;
            //     }
            // }
            var x = evt.clientX;
            var y = evt.clientY;
            var moveXY = {
                x: x - mouseOrigin.x,
                y: y - mouseOrigin.y,
            };
            var $frag_cont = $(selected_artefact).parent().parent().parent().parent();
            console.log($frag_cont.css('top'));
            console.log((parseInt($frag_cont.css('top'), 10) + moveXY.y) + 'px');
            $frag_cont.css({
                top: (parseInt($frag_cont.css('top'), 10) + moveXY.y) + 'px',
                left: (parseInt($frag_cont.css('left'), 10) + moveXY.x) + 'px',
                transform: 'initial'});
            selected_artefact = undefined;
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