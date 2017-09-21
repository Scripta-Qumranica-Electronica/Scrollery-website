function SingleSignEditor(richTextEditor)
{
	this.richTextEditor = richTextEditor;
	const self = this;
	
	$('#confirmSingleSignChangesButton').click(function()
	{
		$('#richTextContainer').appendTo('#RichTextPanel');
		$('#singleSignContainer').appendTo('#hidePanel');
		
		self.potentiallySaveChanges();
	});
	
	$('#cancelSingleSignChangesButton').click(function()
	{
		$('#richTextContainer').appendTo('#RichTextPanel');
		$('#singleSignContainer').appendTo('#hidePanel');
	});

	// TODO clean separation between init and reset (in preparation of next sign)
	
	this.potentialAttributes = // for each: name to display, modification, value, json name, json value
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
		
	this.switchReading = function(alternativeSignId)
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
	};
	
	this.notifySignChange = function(index)
	{
		$('#alternativeSign' + index).addClass('modifiedSign');
	};
	
	this.addAttribute = function(potentialAttributeId)
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
	};
	
	this.removeAttribute = function(currentAttributeId)
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
			self.addAttribute(event.target['id'])
		})

		$('#currentAttribute_' + attribute + '_' + value + '_' + iSign).hide();
	};
	
	this.createSignElement = function(iSign, mainSignId, signData, isMainSign)
	{
		const signElement =
		$('<span></span>')
		.attr('id', 'alternativeSign' + iSign)
		.attr('mainSignId', mainSignId)
		.addClass('alternativeSign')
		.click(function(event)
		{
			self.switchReading(event.target['id']);
		});
		
		if (signData['type'] == null) // letter
		{
			signElement.text(signData['sign']);
		}
		else
		{
			const signPresentation = this.richTextEditor.signType2Visualisation[signData['type']];
			
			if (signPresentation == null) // unknown sign type
			{
				signElement.text('?');
			}
			else
			{
				signElement
				.text(signPresentation)
				.attr('title', signData['type']);
			}
		}
		
		if (isMainSign)
		{
			signElement.addClass('chosenSign');	
		}
		else
		{
			signElement.addClass('otherSign');
		}
		
		return signElement;
	}
	
	this.createAttributesDiv = function(iReading)
	{
		var attributesDiv = $('#attributesDiv' + iReading);
		if (!attributesDiv.length) // div for this sign doesn't exist yet
		{
			attributesDiv =
			$('<div></div>')
			.attr('id', 'attributesDiv' + iReading)
			.addClass('attributesDiv')
			.insertBefore('#signContext');
		}
		else
		{
			attributesDiv.empty();
		}
			
		if (iReading != 0) // show main sign first
		{
			attributesDiv.hide();
		}
		
		return attributesDiv;
	}
	
	this.createAuthorsDiv = function(iAlternative, signData)
	{
		const authorsDiv =
		$('<div></div>')
		.attr('id', 'authorsDiv' + iAlternative)
		.addClass('someSpaceBelow');
		
		const ownersDiv = // TODO
		$('<div></div>')
		.attr('id', 'authorsAcceptance' + iAlternative)
		.addClass('someSpaceBelow')
		.text('Reading accepted by: You')
		.appendTo(authorsDiv);
		
		const commentsDiv =
		$('<div></div>')
		.attr('id', 'authorsComment' + iAlternative)
		.appendTo(authorsDiv);
		
		$('<span></span>')
		.text('Your comment: ')
		.appendTo(commentsDiv);
				
		var commentary =
		(
			signData['comment'] != null
			? signData['comment']
			: ''
		);
		
		$('<input></input>')
		.attr('id', 'commentInput' + iAlternative)
		.val(commentary)
		.change(function(event)
		{
			self.notifySignChange(event.target['id'].replace('commentInput', ''));
		})
		.appendTo(commentsDiv);
		
		return authorsDiv;
	}
	
	this.createAttributesLists = function(iAlternative, signData)
	{
		const attributeChoiceContainer =
		$('<div></div>')
		.attr('id', 'attributeChoiceDiv' + iAlternative);
			
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
		.attr('id', 'widthInput' + iAlternative)
		.attr('placeholder', 'Leave empty for 1.0')
		.val(width)
		.change(function(event)
		{
			self.notifySignChange(event.target['id'].replace('widthInput', ''));
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
		.attr('id', 'currentAttributesDiv' + iAlternative)	
		.addClass('scrollable')
		.addClass('attributesList')
		.appendTo(currentAttributesContainer);
			
		const potentialAttributesContainer =
		$('<div></div>')
		.attr('id', 'potentialAttributesDiv' + iAlternative)
		.addClass('attributesContainer')
		.addClass('someSpaceBelow')
		.appendTo(attributeChoiceContainer);
			
		$('<div></div>')
		.addClass('attributesListHeadline')
		.text('Possible attributes')
		.appendTo(potentialAttributesContainer);
		
		const potentialAttributesDiv =
		$('<div></div>')
		.attr('id', 'potentialAttributesDiv' + iAlternative)	
		.addClass('scrollable')
		.addClass('attributesList')
		.appendTo(potentialAttributesContainer);
				
		for (var iPa in this.potentialAttributes)
		{
			const pa = this.potentialAttributes[iPa];
			
			$('<div></div>')
			.attr('id', 'currentAttribute_' + pa[1] + '_' + pa[2].replace('.', 'ß') + '_' + iAlternative)
			.attr('attribute', pa[1])
			.attr('value', pa[2])
			.attr('iSign', iAlternative)
			.addClass('attribute')
			.text(pa[0])
			.click(function(event)
			{
				self.removeAttribute(event.target['id']);
				
				self.notifySignChange($('#' + event.target['id']).attr('iSign'));
			})
			.hide()
			.appendTo(currentAttributesDiv);
			
			this.removeAttribute('currentAttribute_' + pa[1] + '_' + pa[2].replace('.', 'ß') + '_' + iAlternative);
			
			$('<div></div>')
			.attr('id', 'possibleAttribute_' + pa[1] + '_' + pa[2].replace('.', 'ß') + '_' + iAlternative)
			.attr('attribute', pa[1])
			.attr('value', pa[2])
			.attr('iSign', iAlternative)
			.addClass('attribute')
			.addClass('attribute_' + pa[1] + '_' + iAlternative) // allows groups of attributes
			.text(pa[0])
			.click(function(event)
			{
				self.addAttribute(event.target['id']);
				
				self.notifySignChange($('#' + event.target['id']).attr('iSign'));
			})
			.appendTo(potentialAttributesDiv);
			
			if (signData[pa[3]] == pa[4]) // according to JSON attribute is set // TODO
			{
				this.addAttribute('possibleAttribute_' + pa[1] + '_' + pa[2].replace('.', 'ß') + '_' + iAlternative);
			}
		}
		
		return attributeChoiceContainer;
	}
	
	this.displaySingleSignSpan = function(model, spanId)
	{
		const span = $('#' + spanId);
		if (span == null)
		{
			console.log('span is null');
			return;
		}
		
		const iLine  = span.attr('iLine');
		const iSign  = span.attr('iSign'); // iSign not needed & name collision with loop variable
		const signId = span.attr('signId');
		
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
		
		
		const signData = model[iLine]['signs'][iSign];
		
		
		/** main sign & variants */
		
		this.createSignElement
		(
			iSign,
			signId,
			signData,
			true
		)
		.appendTo(signsDiv);
		
		$('<span></span>')
		.addClass('signDescription')
		.text('(default reading)')
		.appendTo(signsDiv);
		
		var attributesDiv = this.createAttributesDiv(0);
		attributesDiv.show();
		
		this.createAuthorsDiv
		(
			0,
			signData
		)
		.appendTo(attributesDiv);
		
		this.createAttributesLists
		(
			0,
			signData
		)
		.appendTo(attributesDiv);
		
		// TODO sign owner list
		
		if (signData['alternatives'] != null)
		{
			for (var iAlternative in signData['alternatives'])
			{
				this.createSignElement
				(
					iSign + iAlternative + 1,
					signId,
					signData['alternatives'][iAlternative],
					false
				)
				.appendTo(signsDiv);
				
				$('<span></span>')
				.addClass('signDescription')
				.text('(alternative)')
				.appendTo(signsDiv);
				
				attributesDiv = this.createAttributesDiv(iAlternative + 1);
				
				this.createAuthorsDiv
				(
					iAlternative + 1,
					signData['alternatives'][iAlternative]
				)
				.appendTo(attributesDiv);
				
				this.createAttributesLists
				(
					iAlternative + 1,
					signData['alternatives'][iAlternative]
				)
				.appendTo(attributesDiv);
				
				// TODO sign owner list
			}
		}
		
//			if (signData['comment'] != null)
//			{
//				authorsDiv.text('Comments: ' + signData['comment']); // TODO support for multiple comments (each user could have one)
////				commentButton.text('Edit comment');
//			}
//			{
////				commentButton.text('Add comment');
//			}
		
		
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
		
		$('#leftMargin'      + iLine).attr('contentEditable', 'false');
		$('#regularLinePart' + iLine).attr('contentEditable', 'false');
		$('#rightMargin'     + iLine).attr('contentEditable', 'false');
	}
	
	this.potentiallySaveChanges = function()
	{
		var index = 0;
		var possibleReading = $('#possibleReading0');
		
		while (possibleReading.length > 0)
		{
			if (possibleReading.hasClass('modifiedSign'))
			{
				var json = '{"mainSignId":';
				json += possibleReading.attr('mainSignId');
				
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
						'user': _user // TODO
					}
				);
			}
			
			index++;
			possibleReading = $('#possibleReading' + index);
		}
	}
}