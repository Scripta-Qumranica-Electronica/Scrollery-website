
	$('#confirmLogin').click(function() {
			Spider.requestFromServer({
					'request':		'login',
					'USER_NAME':	$('#userNameInput').val(),
					'PASSWORD':		$('#passwordInput').val(),
					'SCROLLVERSION': 1
				},
				function(response) {
					if (response['errorCode'] == 2) {
						$('#notification')
						.text('Invalid user and / or password.')
						.show();
					} else {
						Spider.session_id = response['SESSION_ID'];
						Spider.user_id = response['USER_ID'];
						Spider.user = $('#userNameInput').val();
						$('#login').css('visibility', 'hidden');
						$('#login').css('height', '0');
						$('#login').css('padding', '0');
						$('#login').css('border', 'none');
						$('#editing-panes').css('visibility', 'visible');
						new SingleImageController($("#single-image-container"), 1);
						new CombinationController($("#combination-container"), 1);
						toggleNav(); //Show side menu
						$('.pane-button').prop('checked', true); //Set each pane to visible
						togglePane(); //Refresh panes so they appear
						login();
						Spider.addRichTextEditor();
						//window.location = 'index.html?session=' + response + '&user=' + $('#userNameInput').val();
					}
				},
				function(response) {
					$('#notification').text('Could not connect to server.').show();
				}
			);
		}
	);