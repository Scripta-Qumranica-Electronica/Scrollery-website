var Spider = (function() // singleton central component communication system
{
	// Instance stores a reference to the Singleton
	var instance;

	function init() { // Private methods and variables
		function message(){
			console.log("sent message");
		}
		var doShowServerErrors = true;

		return { // Public methods and variables
			session_id: 'none',
			user: 'none',

			requestFromServer: function(parameters, onSuccess)
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
			},

			getShowServerErrors: function()
			{
				return this.doShowServerErrors;
			},

			setShowServerErrors: function(doShowServerErrors)
			{
				this.doShowServerErrors = doShowServerErrors;
			},

			getParameterByName: function(name, url) //What is this here for???
			{
				if (!url) url = window.location.href;
				name = name.replace(/[\[\]]/g, "\\$&");
				var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
					results = regex.exec(url);
				if (!results) return null;
				if (!results[2]) return '';
				return decodeURIComponent(results[2].replace(/\+/g, " "));
			}
		};
	};

	return { // Get the Singleton instance if one exists, otherwise create it
		getInstance: function() 
		{
			if (!instance) {
				instance = init();
			}
			return instance;
		}
	};
})();