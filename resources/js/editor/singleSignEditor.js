function switchAlternative(index)
{
	$('.attributesDiv:visible').hide();
	$('#attributesDiv' + index).show();
}

function addAttribute(potentialAttributeId)
{
	const pa = $('#' + potentialAttributeId);
	if (pa.length == 0)
	{
		return;
	}
	
	const name = pa.text();
	const attributeAndValue = potentialAttributeId.replace('possibleAttribute_', '');
	const attribute = attributeAndValue.substr(0, attributeAndValue.indexOf('_'));
	const value = attributeAndValue.substr(attributeAndValue.indexOf('_') + 1);
	
	$('.attribute_' + attribute)
	.removeClass('attribute')
	.addClass('chosenAttribute')
	.off('click');
	
	$('#currentAttribute_' + attribute + '_' + value).show();
}

function removeAttribute(currentAttributeId)
{
	const ca = $('#' + currentAttributeId);
	if (ca.length == 0)
	{
		return;
	}
	
	const name = ca.text();
	const attributeAndValue = currentAttributeId.replace('currentAttribute_', '');
	const attribute = attributeAndValue.substr(0, attributeAndValue.indexOf('_'));
	const value = attributeAndValue.substr(attributeAndValue.indexOf('_') + 1);
	
	$('.attribute_' + attribute)
	.addClass('attribute')
	.removeClass('chosenAttribute')
	.click(function(event)
	{
		addAttribute(event.target['id'])
	})

	$('#currentAttribute_' + attribute + '_' + value).hide();
}

function displaySingleSignSpan(span, model)
{
	var spanId = $('#' + span).attr('id');
	if (spanId == null)
	{
		return;
	}
	
	spanId = spanId.replace('span','').split('_');
	if (spanId.length != 2)
	{
		return;
	}
	
	const potentialAttributes = // for each: name to display, modification, value
	[
	 	['width',			'width', 			'1'        ],
	 	['might be wider',	'atLeast',			'true'       ],
	 	['on left margin',	'position',			'leftMargin' ],
	 	['on right margin',	'position',			'rightMargin'],
	 	['above line',		'position',			'aboveLine'  ],
	 	['below line',		'position',			'belowLine'  ],
	 	['reconstructed',	'reconstructed',	'true'       ],
	 	['corrected',		'corrected',		'overwritten'],
	 	['retraced',		'retraced',			'true'       ]
	];
	
	var signData;
	var signElement, signDescription;
	
	const signsDiv = $('#signAndAlternatives');
	signsDiv.empty();
	
	var attributesDiv;
	var authorsDiv, ownersDiv, commentsDiv, commentInput;
	
	var attributeChoiceContainer;
	var currentAttributesContainer, currentAttributesDiv;
	var potentialAttributesContainer, potentialAttributesDiv;
	var potentialAttribute, pa;
	
	for (var iSign in model[spanId[0]])
	{
		signData = model[spanId[0]][iSign];
		
		if (signData['sign'] == null)
		{
			continue;
		}
		
		
		/** main sign and alternative ones */
		
		signElement =
		$('<span></span>')
		.attr('id', 'alternativeSign' + iSign)
		.text(signData['sign'])
		.click(function()
		{
			switchAlternative(iSign); // TODO declaration this way saves current state of iSign?
		})
		.appendTo(signsDiv);
		
		signDescription =
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
		
		attributesDiv = $('#attributesDiv' + iSign);
		if (!attributesDiv.length) // div for this sign doesn't exist yet
		{
			attributesDiv =
			$('<div></div>')
			.attr('id', 'attributesDiv' + iSign)
			.addClass('attributesDiv')
			.insertBefore('#closeSingleSignViewButton');
			
			
			/** owners, comments */		// TODO remove div variable references where not necessary
			
			authorsDiv =
			$('<div></div>')
			.attr('id', 'authorsDiv' + iSign)
			.addClass('someSpaceBelow')
			.appendTo(attributesDiv);
			
				ownersDiv =	// TODO
				$('<div></div>')
				.attr('id', 'authorsDiv' + iSign)
				.addClass('someSpaceBelow')
				.text('These people agree on this reading: You')
				.appendTo(authorsDiv);
			
				commentsDiv =
				$('<div></div>')
				.attr('id', 'authorsDiv' + iSign)
				.appendTo(authorsDiv);
			
					$('<span></span>')
					.text('Your comment: ')
					.appendTo(commentsDiv);
					
					commentInput =
					$('<input></input>')
					.appendTo(commentsDiv);
					
					if (signData['comment'] != null)
					{
						commentInput.val(signData['comment']);
					}
			
			
			/** attribute lists */
			
			attributeChoiceContainer =
			$('<div></div>')
			.attr('id', 'attributeChoiceDiv' + iSign)
			.appendTo(attributesDiv);
			
				currentAttributesContainer =
				$('<div></div>')
				.addClass('attributesContainer')
				.addClass('someSpaceBelow')
				.appendTo(attributeChoiceContainer);
				
					$('<div></div>')
					.addClass('attributesListHeadline')
					.text('Current attributes')
					.appendTo(currentAttributesContainer);
					
					currentAttributesDiv =
					$('<div></div>')
					.attr('id', 'currentAttributesDiv' + iSign)	
					.addClass('scrollable')
					.addClass('attributesList')
					.appendTo(currentAttributesContainer);
				
				potentialAttributesContainer =
				$('<div></div>')
				.attr('id', 'potentialAttributesDiv' + iSign)
				.addClass('attributesContainer')
				.addClass('someSpaceBelow')
				.appendTo(attributeChoiceContainer);
				
					$('<div></div>')
					.addClass('attributesListHeadline')
					.text('Possible attributes')
					.appendTo(potentialAttributesContainer);
					
					potentialAttributesDiv =
					$('<div></div>')
					.attr('id', 'potentialAttributesDiv' + iSign)	
					.addClass('scrollable')
					.addClass('attributesList')
					.appendTo(potentialAttributesContainer);
					
			for (var iPa in potentialAttributes)
			{
				pa = potentialAttributes[iPa];
				
				$('<div></div>')
				.attr('id', 'currentAttribute_' + pa[1] + '_' + pa[2].replace('.', 'ß'))
				.addClass('attribute')
				.text(pa[0])
				.click(function(event)
				{
					removeAttribute(event.target['id'])
				})
				.hide()
				.appendTo(currentAttributesDiv);

				$('<div></div>')
				.attr('id', 'possibleAttribute_' + pa[1] + '_' + pa[2].replace('.', 'ß'))
				.addClass('attribute')
				.addClass('attribute_' + pa[1]) // allows groups of attributes
				.text(pa[0])
				.click(function(event)
				{
					addAttribute(event.target['id'])
				})
				.appendTo(potentialAttributesDiv);
			}
			
			// TODO use addAttribute() to insert existing attributes
		}
		else // fill elements with current data
		{
			// TODO for relevant elements
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
	}
}

function initSingleSignEditor()
{
	$('#closeSingleSignViewButton').click(function()
	{
		$('#wysiwygContainer').appendTo('#WysiwygPanel');
		$('#singleSignContainer').appendTo('#hidePanel');
	});
}