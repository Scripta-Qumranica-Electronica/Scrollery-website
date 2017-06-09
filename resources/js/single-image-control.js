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
				$new_image = $(document.createElement('div')).attr('id', 'single_image-' + entry['filename']);
				$($new_image).attr('class', 'single-image-view');
				$('#single-image-pane').append($new_image);
				var infoJsonUrl = 'http://134.76.19.179/cgi-bin/iipsrv.fcgi?IIIF=P1096-Fg006-R-C01-R01-D25112012-T112913-LR445__ColorCalData_IAA_Both_CC110304_110702.tif/info.json';
				var infoJsonUrl = 'http://134.76.19.179/cgi-bin/iipsrv.fcgi?IIIF=' + entry['filename'] + '/info.json';
				jQuery.getJSON(infoJsonUrl).done(function (infoJson, status, jqXHR) {
					var viewer = OpenSeadragon({
						id: 'single_image-' + entry['filename'],
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
			});
    	}
	});
}
