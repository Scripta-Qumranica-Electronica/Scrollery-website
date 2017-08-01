function Spider() // singleton central component communication system
{  
    if (typeof Spider.instance === 'object') // instance already exists
    {
        return Spider.instance;
    }
    
    this.doShowServerErrors = true;
}

Spider.prototype.requestFromServer = function(parameters, onReturn)
{
	console.log('before request ' + new Date().getTime());
	parameters['timeStamp'] = Date.now(); // TODO replace now() entries in DB bei this time, retry connection regularly
	
	$.post
	(
		'resources/cgi-bin/server.pl', // connection to perl works only if same server ('same origin')
		parameters
	)
	.done
	(
		function(data)
		{
			// console.log('response on ' + parameters['request'] + ':');
			// console.log(data);
			
			if (onReturn != null)
			{
				onReturn(data);
			}
			
			console.log('after request ' + new Date().getTime());
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

Spider.prototype.notifyChangedText = function(textObject)
{
	this.textObject = textObject;
	
	displayModel(textObject);
}

var Spider = new Spider();