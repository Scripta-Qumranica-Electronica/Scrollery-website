function Spider() // singleton central component communication system
{
	/** constructor */
	
	{ 
	    if (typeof Spider.instance === 'object') // instance already exists
	    {
	        return Spider.instance;
	    }
	    
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
	
	/** functions */
	
	this.requestFromServer = function(parameters, onReturn)
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
	
	this.requestTextFromAPI = function(parameters, onReturn)
	{
		console.log('before request ' + new Date().getTime());
		
		const address = // TODO get rid of this check later
		(
			window.navigator.platform.indexOf('Win') == -1	
			? '/sqe_api/run_api.cgi' // Linux (VM)
//			: 'cgi-bin-ingo/run_api.cgi' // Windows (local testing)
			: 'https://134.76.19.179/sqe_api/run_api.cgi'
		);
		$.post
		(
			address,
			{
				'USER_NAME': parameters['user'],
				'PASSWORD' : parameters['pw'],
				'GET'      : 'TEXT',
				'SCROLL'   : parameters['scroll'],
				'FRAGMENT' : parameters['fragment']
			}
		)
		.done
		(
			function(data)
			{
				console.log('after request ' + new Date().getTime());
				
				console.log('response on GET TEXT:');
				console.log(data);
				
				if (onReturn != null)
				{
					onReturn(data);
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
	
	this.getShowServerErrors = function()
	{
		return this.doShowServerErrors;
	}
	
	this.setShowServerErrors = function(doShowServerErrors)
	{
		this.doShowServerErrors = doShowServerErrors;
	}
	
	this.notifyChangedText = function(json)
	{
		this.textObject = json['VALUE']['FRAGMENTS'][0]['LINES'];
		
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
