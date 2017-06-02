var infoJsonUrl = 'http://134.76.19.179/cgi-bin/iipsrv.fcgi?IIIF=P1096-Fg006-R-C01-R01-D25112012-T112913-LR445__ColorCalData_IAA_Both_CC110304_110702.ptif/info.json';
var infoJson;
jQuery.getJSON(infoJsonUrl).done(function (infoJson, status, jqXHR) {
	var viewer = OpenSeadragon({id: "single-image-view",
															preserveViewport: true,
													    visibilityRatio:    1,
													    minZoomLevel:       1,
													    defaultZoomLevel:   1,
													    sequenceMode:       false,
															tileSources: infoJson,
															prefixUrl: 'resources/images/',
                              navigationControlAnchor: OpenSeadragon.ControlAnchor.BOTTOM_LEFT});
});
