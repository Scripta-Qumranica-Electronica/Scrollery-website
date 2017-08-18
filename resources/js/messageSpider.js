function Spider() // singleton central component communication system
{  
    if (typeof Spider.instance === 'object') // instance already exists
    {
        return Spider.instance;
    }
    
	this.doShowServerErrors = true;
	this.session_id = "";
	this.user = "";
	this.current_combination;
	this.current_version;
	this.registered_objects = {
		load_scroll: [],
		load_fragment: []
	};
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

//Register objects for message notification (add message titles to the this.registered_objects object here).
//The message variable is an object with two variables: "type" is the type of message to respond to 
//(corresponding to the variable in this.registered_objects object), "execute_function" is essentially
//a callback for the function to be executed (make sure to maintain context by using var self = this in the
//calling object and then referring to functions in the callback with "self.")
Spider.prototype.register_object = function(messages)
{
	messages.forEach(function(message){
		this.registered_objects[message.type].push({'execute_function': message.execute_function});
	}, this);
}

Spider.prototype.propagate_command = function(command, data)
{
	this.registered_objects[command].forEach(function(listening_object){
		listening_object.execute_function(data);
	});
}

var Spider = new Spider();