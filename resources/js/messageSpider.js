function Spider() // singleton central component communication system
{  
    if (typeof Spider.instance === 'object') // instance already exists
    {
        return Spider.instance;
	}
	this.session_id = 'none';
	this.user = 'none';
    this.doShowServerErrors = true;
}

Spider.prototype.requestFromServer = function(parameters, onSuccess)
{
	parameters['timeStamp'] = Date.now(); // TODO replace now() entries in DB bei this time, retry connection regularly
	
	$.post
	(
		'cgi/server.pl', // connection to perl works only if same server ('same origin')
		parameters
	)
	.done
	(
		function(data)
		{
			console.log('success at ' + parameters['request'] + ':');
			console.log(data);
			
			if (onSuccess != null)
			{
				onSuccess(data);
			}
		}
	)
	.fail
	(
		function(data)
		{
			if (this.doShowServerErrors)
			{
				console.log('failure:');
				console.log(data);
			}
		}
	);
}

Spider.prototype.getShowServerErrors = function()
{
	return this.doShowServerErrors;
}

Spider.prototype.setShowServerErrors = function(doShowServerErrors)
{
	this.doShowServerErrors = doShowServerErrors;
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var Spider = new Spider();