function Spider() // singleton central component communication system
{
	/** constructor */
	
	{ 
	    if (typeof Spider.instance === 'object') // instance already exists
	    {
	        return Spider.instance;
	    }
	    
	    this.doShowRequests = true;
	    this.doShowServerErrors = true;
	    this.session_id = "";
	    this.user_id = "";
	    this.user = "";
	    this.current_combination;
	    this.current_version;
	    this.registered_objects = {
	    	load_scroll: [],
		load_fragment: []
	    };
	    
		$(document).ajaxError // log server connection errors to console
		(
			function(event, request, settings)
			{
				if (Spider.doShowServerErrors)
				{
					console.log('<CONNECTION ERROR>');
					console.log('TARGET: ' + settings.url);
					console.log('Parameters:');
					console.log(settings.data);	// separate line makes check in debug tools easier 
					console.log('Error type: ' + event.type);
					console.log('Request status: ' + request.status + ' (' + request.statusText + ')');
					console.log('</CONNECTION ERROR>');
				}
			}
		);
	}
	
	/** functions */
	
	this.requestFromServer = function(parameters, onSuccess, onFailure)
	{
//		console.log('before request ' + new Date().getTime());
//		parameters['timeStamp'] = Date.now(); // TODO replace now() entries in DB bei this time, retry connection regularly
		
		if (this.session_id != '')
		{
			parameters['SESSION_ID'] = this.session_id;
		}
		
		if (this.doShowRequests)
		{
			console.log('Request');
			for (var key in parameters)
			{
				console.log('* ' + key + ': ' + parameters[key]);
			}
		}
		
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
				
				if (onSuccess != null)
				{
					onSuccess(data);
				}
				
//				console.log('after request ' + new Date().getTime());
			}
		)
		.fail
		(
			function(data)
			{
				if (onFailure != null)
				{
					onFailure(data);
				}
				
				if (this.doShowServerErrors)
				{
					console.log('failure:');
					console.log(data);
				}
			}
		);
	}
	
	this.notifyChangedText = function(data)
	{
		console.log('text');
		console.log(data);
		this.textObject = data;
		
		this.richTextEditor.displayModel(this.textObject);
	}
	
	// TODO support for multiple rich text editors with add & remove methods?
	this.addRichTextEditor = function()
	{
		this.richTextEditor = new RichTextEditor();
	}
	
	//Register objects for message notification (add message titles to the this.registered_objects object here).
	//The message variable is an object with two variables: "type" is the type of message to respond to 
	//(corresponding to the variable in this.registered_objects object), "execute_function" is essentially
	//a callback for the function to be executed (make sure to maintain context by using var self = this in the
	//calling object and then referring to functions in the callback with "self.")
	this.register_object = function(messages)
	{
		messages.forEach(function(message){
			this.registered_objects[message.type].push({'execute_function': message.execute_function});
		}, this);
	}

	this.propagate_command = function(command, data)
	{
		this.registered_objects[command].forEach(function(listening_object){
			listening_object.execute_function(data);
		});
	}
}

// initialize right here
var Spider = new Spider();