function switchAlternative(alternativeSignId)
{
	const index = alternativeSignId.replace('alternativeSign', '');
	
	$('.attributesDiv:visible').hide();
	$('#attributesDiv' + index).show();
	
	$('.alternativeSign')
	.removeClass('chosenSign')
	.addClass('otherSign');
	
	$('#' + alternativeSignId)
	.removeClass('otherSign')
	.addClass('chosenSign');
}

function notifySignChange(index)
{
	console.log('change index ' + index);
	
	$('#alternativeSign' + index).addClass('modifiedSign');
}

function addAttribute(potentialAttributeId)
{
	const pa = $('#' + potentialAttributeId);
	if (pa.length == 0)
	{
		return;
	}
	
	const attribute = pa.attr('attribute');
	const value = pa.attr('value');
	const iSign = pa.attr('iSign');
	
	$('.attribute_' + attribute + '_' + iSign)
	.removeClass('attribute')
	.addClass('chosenAttribute')
	.off('click');
	
	$('#currentAttribute_' + attribute + '_' + value + '_' + iSign).show();
}

function removeAttribute(currentAttributeId)
{
	const ca = $('#' + currentAttributeId);
	if (ca.length == 0)
	{
		return;
	}
	
	const attribute = ca.attr('attribute');
	const value = ca.attr('value');
	const iSign = ca.attr('iSign');
	
	$('.attribute_' + attribute + '_' + iSign)
	.addClass('attribute')
	.removeClass('chosenAttribute')
	.click(function(event)
	{
		addAttribute(event.target['id'])
	})

	$('#currentAttribute_' + attribute + '_' + value + '_' + iSign).hide();
}

function displaySingleSignSpan(model, spanId)
{
	const span = $('#' + spanId);
	if (span == null)
	{
		return;
	}
	
	const iLine = span.attr('iLine');
	const iAlternative = span.attr('iAlternative');
//	const iSign = span.attr('iSign'); // not needed & name collision with loop variable 
	const signId = span.attr('signId');
	
	const potentialAttributes = // for each: name to display, modification, value, json name, json value
	[
	 	['might be wider',	'atLeast',			'true',			'mightBeWider',		1				],
	 	['on left margin',	'position',			'leftMargin',	'position',			'LEFT_MARGIN'	],
	 	['on right margin',	'position',			'rightMargin',	'position',			'RIGHT_MARGIN'	],
	 	['above line',		'position',			'aboveLine',	'position',			'ABOVE_LINE'	],
	 	['below line',		'position',			'belowLine',	'position',			'BELOW_LINE'	],
	 	['reconstructed',	'reconstructed',	'true',			'reconstructed',	1				],
	 	['corrected',		'corrected',		'overwritten',	'corrected',		'OVERWRITTEN'	],
	 	['retraced',		'retraced',			'true',			'retraced',			1				]
	];
	
	// TODO smoothen reset code
	
	const hidePanel = $('#hidePanel');
	$('#signAndAlternatives').appendTo(hidePanel);
	$('#signContext').appendTo(hidePanel);
	$('#confirmSingleSignChangesButton').appendTo(hidePanel);
	$('#cancelSingleSignChangesButton').appendTo(hidePanel);
	
	const container = $('#singleSignContainer').empty();
	$('#signAndAlternatives').appendTo(container);
	$('#signContext').appendTo(container);
	$('#confirmSingleSignChangesButton').appendTo(container);
	$('#cancelSingleSignChangesButton').appendTo(container);
	
	const signsDiv = 
	$('#signAndAlternatives')
	.empty(); // reset displayed main sign & variants
	
	for (var iSign in model[iLine]['signs'][iAlternative])
	{
		const signData = model[iLine]['signs'][iAlternative][iSign];
		
		if (signData['sign'] == null)
		{
			continue;
		}
		
		
		/** main sign & variants */
		
		const signElement =
		$('<span></span>')
		.attr('id', 'alternativeSign' + iSign)
		.attr('mainSignId', signId) // TODO first sign of alternative is not necessarily the main sign 
		.addClass('alternativeSign')
		.click(function(event)
		{
			switchAlternative(event.target['id']);
		})
		.appendTo(signsDiv);
		
		if (signData['signType'] == null) // letter
		{
			signElement.text(signData['sign']);
		}
		else
		{
			const signPresentation = _signType2Visualisation[signData['signType']];
			
			if (signPresentation == null) // unknown sign type
			{
				signElement.text('?');
			}
			else
			{
				signElement
				.text(signPresentation)
				.attr('title', signData['signType']);
			}
		}
		
		const signDescription =
		$('<span></span>')
		.addClass('signDescription')
		.appendTo(signsDiv);
		
		if (iSign == 0) // TODO more sophisticated check
		{
			signElement.addClass('chosenSign');
			signDescription.text('(default reading)');
		}
		else
		{
			signElement.addClass('otherSign');
			signDescription.text('(alternative)'); // TODO differentiate more
		}
		
		
		/** owners, comments, attribute lists */
		
		var attributesDiv = $('#attributesDiv' + iSign);
		if (!attributesDiv.length) // div for this sign doesn't exist yet
		{
			attributesDiv =
			$('<div></div>')
			.attr('id', 'attributesDiv' + iSign)
			.addClass('attributesDiv')
			.insertBefore('#signContext');
		}
		else
		{
			attributesDiv.empty();
		}
			
		if (iSign != 0) // show main sign first
		{
			attributesDiv.hide();
		}
		
		
		/** owners, comments */
		
		const authorsDiv =
		$('<div></div>')
		.attr('id', 'authorsDiv' + iSign)
		.addClass('someSpaceBelow')
		.appendTo(attributesDiv);
		
			const ownersDiv =	// TODO
			$('<div></div>')
			.attr('id', 'authorsDiv' + iSign)
			.addClass('someSpaceBelow')
			.text('Reading accepted by: You')
			.appendTo(authorsDiv);
		
			const commentsDiv =
			$('<div></div>')
			.attr('id', 'authorsDiv' + iSign)
			.appendTo(authorsDiv);
		
				$('<span></span>')
				.text('Your comment: ')
				.appendTo(commentsDiv);
				
				var commentary = '';
				if (signData['comment'] != null)
				{
					commentary = signData['comment'];
				}
				
				const commentInput =
				$('<input></input>')
				.attr('id', 'commentInput' + iSign)
				.val(commentary)
				.change(function(event)
				{
					notifySignChange(event.target['id'].replace('commentInput', ''));
				})
				.appendTo(commentsDiv);
				
		
		
		/** attribute lists */
		
		const attributeChoiceContainer =
		$('<div></div>')
		.attr('id', 'attributeChoiceDiv' + iSign)
		.appendTo(attributesDiv);
			
			$('<span></span>')
			.text('Width: ')
			.appendTo(attributeChoiceContainer);
			
			var width = '';
			if (signData['width'] != null)
			{
				width = signData['width'];
			}
			
			const widthInput =
			$('<input></input>')
			.attr('id', 'widthInput' + iSign)
			.attr('placeholder', 'Leave empty for 1.0')
			.val(width)
			.change(function(event)
			{
				notifySignChange(event.target['id'].replace('widthInput', ''));
			})
			.appendTo(attributeChoiceContainer);
			
			
			$('<br>')
			.appendTo(attributeChoiceContainer);
			
			$('<br>')
			.appendTo(attributeChoiceContainer);

			const currentAttributesContainer =
			$('<div></div>')
			.addClass('attributesContainer')
			.addClass('someSpaceBelow')
			.appendTo(attributeChoiceContainer);
			
				$('<div></div>')
				.addClass('attributesListHeadline')
				.text('Current attributes')
				.appendTo(currentAttributesContainer);
				
				const currentAttributesDiv =
				$('<div></div>')
				.attr('id', 'currentAttributesDiv' + iSign)	
				.addClass('scrollable')
				.addClass('attributesList')
				.appendTo(currentAttributesContainer);
			
			const potentialAttributesContainer =
			$('<div></div>')
			.attr('id', 'potentialAttributesDiv' + iSign)
			.addClass('attributesContainer')
			.addClass('someSpaceBelow')
			.appendTo(attributeChoiceContainer);
			
				$('<div></div>')
				.addClass('attributesListHeadline')
				.text('Possible attributes')
				.appendTo(potentialAttributesContainer);
				
				const potentialAttributesDiv =
				$('<div></div>')
				.attr('id', 'potentialAttributesDiv' + iSign)	
				.addClass('scrollable')
				.addClass('attributesList')
				.appendTo(potentialAttributesContainer);
				
		for (var iPa in potentialAttributes)
		{
			const pa = potentialAttributes[iPa];
			
			$('<div></div>')
			.attr('id', 'currentAttribute_' + pa[1] + '_' + pa[2].replace('.', 'ß') + '_' + iSign)
			.attr('attribute', pa[1])
			.attr('value', pa[2])
			.attr('iSign', iSign)
			.addClass('attribute')
			.text(pa[0])
			.click(function(event)
			{
				removeAttribute(event.target['id']);
				notifySignChange($('#' + event.target['id']).attr('iSign'));
			})
			.hide()
			.appendTo(currentAttributesDiv);
			
			removeAttribute('currentAttribute_' + pa[1] + '_' + pa[2].replace('.', 'ß') + '_' + iSign);
			
			$('<div></div>')
			.attr('id', 'possibleAttribute_' + pa[1] + '_' + pa[2].replace('.', 'ß') + '_' + iSign)
			.attr('attribute', pa[1])
			.attr('value', pa[2])
			.attr('iSign', iSign)
			.addClass('attribute')
			.addClass('attribute_' + pa[1] + '_' + iSign) // allows groups of attributes
			.text(pa[0])
			.click(function(event)
			{
				addAttribute(event.target['id']);
				notifySignChange($('#' + event.target['id']).attr('iSign'));
			})
			.appendTo(potentialAttributesDiv);
			
			if (signData[pa[3]] == pa[4]) // according to JSON attribute is set
			{
				addAttribute('possibleAttribute_' + pa[1] + '_' + pa[2].replace('.', 'ß') + '_' + iSign);
			}
		}
		
		
		/** sign owners and comments */
		
		// TODO owners
		
		
//		if (signData['comment'] != null)
//		{
//			authorsDiv.text('Comments: ' + signData['comment']); // TODO support for multiple comments (each user could have one)
////			commentButton.text('Edit comment');
//		}
//		{
////			commentButton.text('Add comment');
//		}
		
		
		
		/** line context */
		
		$('#singleSignContainer > .someSpaceBelow').remove(); // remove previous line context
		
		const line = $('#line' + iLine);
		if (line.length > 0) // line exists (it should)
		{
			line
			.clone() // deep copy without event handlers or data
			.attr('dir', 'rtl')
			.addClass('someSpaceBelow')
			.insertAfter('#signContext');
		}
	}
}

function potentiallySaveChanges()
{
	var index = 0;
	var alternativeSign = $('#alternativeSign0');
	
	while (alternativeSign.length > 0)
	{
		if (alternativeSign.hasClass('modifiedSign'))
		{
			var json = '{"mainSignId":';
			json += alternativeSign.attr('mainSignId');
			
			// TODO saubere transformation bei nichtbuchstaben
			json += ',"sign":"' + $('#alternativeSign0').text() + '"';
			
			const width = $('#widthInput' + index).val();
			if (width != null
			&&  width != ''
			&&  width == 1 * width) // width is a number
			{
				json += ',"width":' + width;
			}
			else // user might remove the previous width entry
			{
				json += ',"width":1';
			}
			
			const commentary = $('#commentInput' + index).val();
			if (commentary != null
			&&  commentary != '')
			{
				json += ',"commentary":"' + commentary + '"';
			}
			else // user can remove commentary
			{
				json += ',"commentary":""';
			}
			
			// TODO streamline based on big array (which might belong to spider)
			if ($('#currentAttribute_atLeast_true_' + index).css('display') != 'none')
			{
				json += ',"mightBeWider":1';
			}
			if ($('#currentAttribute_position_leftMargin_' + index).css('display') != 'none')
			{
				json += ',"position":"LEFT_MARGIN"';
			}
			if ($('#currentAttribute_position_rightMargin_' + index).css('display') != 'none')
			{
				json += ',"position":"RIGHT_MARGIN"';
			}
			if ($('#currentAttribute_position_aboveLine_' + index).css('display') != 'none')
			{
				json += ',"position":"ABOVE_LINE"';
			}
			if ($('#currentAttribute_position_belowLine_' + index).css('display') != 'none')
			{
				json += ',"position":"BELOW_LINE"';
			}
			if ($('#currentAttribute_reconstructed_true_' + index).css('display') != 'none')
			{
				json += ',"reconstructed":1';
			}
			if ($('#currentAttribute_corrected_overwritten_' + index).css('display') != 'none')
			{
				json += ',"corrected":"OVERWRITTEN"';
			}
			if ($('#currentAttribute_retraced_true_' + index).css('display') != 'none')
			{
				json += ',"retraced":1';
			}
			
			json += '}';
			
			console.log('json to save ' + json);
			
			Spider.requestFromServer
			(
				{
					'request': 'potentiallySaveNewVariant',
					'variant': json,
					'user': _user
				}
			);
		}
		
		index++;
		alternativeSign = $('#alternativeSign' + index);
	}
}

function initSingleSignEditor()
{
	$('#confirmSingleSignChangesButton').click(function()
	{
		$('#richTextContainer').appendTo('#RichTextPanel');
		$('#singleSignContainer').appendTo('#hidePanel');
		
		potentiallySaveChanges();
	});
	
	$('#cancelSingleSignChangesButton').click(function()
	{
		$('#richTextContainer').appendTo('#RichTextPanel');
		$('#singleSignContainer').appendTo('#hidePanel');
	});
}