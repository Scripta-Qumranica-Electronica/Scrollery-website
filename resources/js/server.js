function initServerConnection()
{
	$(document).ajaxError // log server connection errors to console
	(
		function(event, request, settings)
		{
			if (Spider.getShowServerErrors())
			{
				console.log('Connection error');
				console.log('* target: ' + settings.url);
				console.log('* parameters: ' + settings.data);
				console.log('* error type: ' + event.type);
				console.log('* request status: ' + request.status + ' (' + request.statusText + ')');
			}
		}
	);
}

// server connection is handled by messageSpider.js