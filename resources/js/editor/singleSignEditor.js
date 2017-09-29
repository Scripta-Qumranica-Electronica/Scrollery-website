function SingleSignEditor(richTextEditor)
{
	this.richTextEditor = richTextEditor;
	const self = this;
	
	$('#addReadingPseudoButton').click(function()
	{
		if (Spider.unlocked == false)
		{
			return;
		}
		
		$('#addReadingPseudoButton').appendTo('#hidePanel');
		
		$('#addReadingInput').val(''); // reset input field 
		$('#addReadingDiv').appendTo('#signAndAlternatives');
	});
	
	$('#confirmAddReadingButton').click(function()
	{
		if (Spider.unlocked == false)
		{
			return;
		}
		
		const newReading = $('#addReadingInput').val();
		
		if (newReading.length == 1) // ignore empty entry and multiple chars
		{
			const existingReadingElements = $('.alternativeSign');
			var readingAlreadyExists = false;
			for (var iElement in existingReadingElements)
			{
				if (existingReadingElements[iElement].textContent == newReading)
				{
					readingAlreadyExists = true;
					break;
				}
			}
			
			if (!readingAlreadyExists)
			{
				const iReading = $('.alternativeSign').length;
				const signData = { 'sign': newReading };
				const signsDiv = $('#signAndAlternatives');
				
				self.createSignElement
				(
					iReading,
					$('#reading0').attr('mainSignId'),
					signData,
					false
				)
				.appendTo(signsDiv);
				
				// TODO special mark for newly added reading?

				$('<span></span>')
				.addClass('signDescription')
				.text('(variant)')
				.appendTo(signsDiv);
				
				const attributesDiv = self.createAttributesDiv(iReading);
				
				self.createAttributesLists
				(
					iReading,
					signData
				)
				.appendTo(attributesDiv);
				
				self.switchReading(iReading);
			}
		}
		
		$('#addReadingDiv').appendTo('#hidePanel');
		
		$('#addReadingPseudoButton').appendTo('#signAndAlternatives');
	});
	
	$('#cancelAddReadingButton').click(function()
	{
		$('#addReadingDiv').appendTo('#hidePanel');
		
		$('#addReadingPseudoButton').appendTo('#signAndAlternatives');
	});
	
//	$('#confirmSingleSignChangesButton').click(function()
//	{
//		$('#richTextContainer').appendTo('#RichTextPanel');
//		$('#singleSignContainer').appendTo('#hidePanel');
//		
//		self.potentiallySaveChanges();
//	});
//	
//	$('#cancelSingleSignChangesButton').click(function()
//	{
//		$('#richTextContainer').appendTo('#RichTextPanel');
//		$('#singleSignContainer').appendTo('#hidePanel');
//	});
	
	$('#finishSingleSignChangesButton').click(function()
	{
		$('#richTextContainer').appendTo('#RichTextPanel');
		$('#singleSignContainer').appendTo('#hidePanel');
	});
	
	// TODO clean separation between init and reset (in preparation of next sign)
	
	this.possibleAttributes = // TODO change parser output to JSON format
	[
	 	{
	 		'displayName'  : 'might be wider',
	 		'jsonAttribute': 'mightBeWider',
	 		'jsonValue'    : 1
	 	},
	 	{
	 		'displayName'  : 'on left margin',
	 		'jsonAttribute': 'position', // for grouping of modifications
	 		'jsonValue'    : 'leftMargin'
	 	},
	 	{
	 		'displayName'  : 'on right margin',
	 		'jsonAttribute': 'position',
	 		'jsonValue'    : 'rightMargin'
	 	},
	 	{
	 		'displayName'  : 'above line',
	 		'jsonAttribute': 'position',
	 		'jsonValue'    : 'aboveLine'
	 	},
	 	{
	 		'displayName'  : 'below line',
	 		'jsonAttribute': 'position',
	 		'jsonValue'    : 'belowLine'
	 	},
	 	{
	 		'displayName'  : 'reconstructed',
	 		'jsonAttribute': 'reconstructed',
	 		'jsonValue'    : 1
	 	},
	 	{
	 		'displayName'  : 'corrected',
	 		'jsonAttribute': 'corrected',
	 		'jsonValue'    : 'OVERWRITTEN' // TODO
	 	},
	 	{
	 		'displayName'  : 'retraced',
	 		'jsonAttribute': 'retraced',
	 		'jsonValue'    : 1
	 	}
	];
		
	this.switchReading = function(readingId)
	{
		$('.attributesDiv:visible').hide();
		$('#attributesDiv' + readingId).show();
		
		$('.alternativeSign')
		.removeClass('chosenSign')
		.addClass('otherSign');
		
		$('#reading' + readingId)
		.removeClass('otherSign')
		.addClass('chosenSign');
	};
	
	this.notifySignChange = function(index)
	{
		if (Spider.unlocked == false)
		{
			return;
		}
		
		$('#reading' + index).addClass('modifiedSign');
	};
	
	this.addAttribute = function(possibleAttributeId)
	{
		if (Spider.unlocked == false)
		{
			return;
		}
		
		const pa = $('#' + possibleAttributeId);
		if (pa.length == 0)
		{
			console.log('pa.length == 0')
			return;
		}
		
		const attribute = pa.attr('attribute');
		const value = pa.attr('value');
		const iSign = pa.attr('iSign');
		
		$('.attribute_' + attribute + '_' + iSign)
		.removeClass('attribute')
		.addClass('chosenAttribute')
		.off('click');
		
		$('#' + possibleAttributeId.replace('possibleAttribute', 'currentAttribute')).show();
	};
	
	this.removeAttribute = function(currentAttributeId)
	{
		if (Spider.unlocked == false)
		{
			return;
		}
		
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

		ca.hide();
	};
	
	this.createSignElement = function(iReading, mainSignId, signData, isMainSign)
	{
		const signElement =
		$('<span></span>')
		.attr('id', 'reading' + iReading)
		.attr('mainSignId', mainSignId)
		.addClass('alternativeSign')
		.click(function(event)
		{
			self.switchReading(event.target['id'].replace('reading', ''));
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
				.text(signPresentation);
			}
		}
		
		if (isMainSign)
		{
			signElement.addClass('chosenSign');	
		}
		else
		{
			signElement.addClass('someSpaceToTheLeft'); // TODO variant readings are not necessarily the second or later
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
	
	this.createAuthorsDiv = function(iReading, signData)
	{
		var authorsDiv =
		$('<div></div>')
		.attr('id', 'authorsDiv' + iReading)
		.addClass('someSpaceBelow');
		
//		const ownersDiv = // TODO
//		$('<div></div>')
//		.attr('id', 'authorsAcceptance' + iReading)
//		.addClass('someSpaceBelow')
//		.text('Reading accepted by: You')
//		.appendTo(authorsDiv);
//		
//		const commentsDiv =
//		$('<div></div>')
//		.attr('id', 'authorsComment' + iReading)
//		.appendTo(authorsDiv);
//		
//		$('<span></span>')
//		.text('Your comment: ')
//		.appendTo(commentsDiv);
//				
//		var commentary =
//		(
//			signData['comment'] != null
//			? signData['comment']
//			: ''
//		);
//		
//		$('<input></input>')
//		.attr('id', 'commentInput' + iReading)
//		.val(commentary)
//		.change(function(event)
//		{
//			self.notifySignChange(event.target['id'].replace('commentInput', ''));
//		})
//		.appendTo(commentsDiv);
		
		return authorsDiv;
	}
	
	this.createAttributesLists = function(iReading, signData)
	{
		const attributeChoiceContainer =
		$('<div></div>')
		.attr('id', 'attributeChoiceDiv' + iReading);
			
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
		.attr('id', 'widthInput' + iReading)
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
		.attr('id', 'currentAttributesDiv' + iReading)	
		.addClass('scrollable')
		.addClass('attributesList')
		.appendTo(currentAttributesContainer);
			
		const potentialAttributesContainer =
		$('<div></div>')
		.attr('id', 'potentialAttributesDiv' + iReading)
		.addClass('attributesContainer')
		.addClass('someSpaceBelow')
		.appendTo(attributeChoiceContainer);
			
		$('<div></div>')
		.addClass('attributesListHeadline')
		.text('Possible attributes')
		.appendTo(potentialAttributesContainer);
		
		const potentialAttributesDiv =
		$('<div></div>')
		.attr('id', 'potentialAttributesDiv' + iReading)	
		.addClass('scrollable')
		.addClass('attributesList')
		.appendTo(potentialAttributesContainer);
				
		for (var iPa in this.possibleAttributes)
		{
			const pa = this.possibleAttributes[iPa];
			
			$('<div></div>')
			.attr('id', 'currentAttribute_' + iPa + '_' + iReading)
			.attr('attribute', pa['jsonAttribute'])
			.attr('value', pa['jsonValue'])
			.attr('iSign', iReading)
			.addClass('attribute')
			.text(pa['displayName'])
			.click(function(event)
			{
				self.removeAttribute(event.target['id']);
				
				self.notifySignChange($('#' + event.target['id']).attr('iSign'));
			})
			.hide()
			.appendTo(currentAttributesDiv);
			
			$('<div></div>')
			.attr('id', 'possibleAttribute_' + iPa + '_' + iReading)
			.attr('attribute', pa['jsonAttribute'])
			.attr('value', pa['jsonValue'])
			.attr('iSign', iReading)
			.addClass('attribute')
			.addClass('attribute_' + pa['jsonAttribute'] + '_' + iReading) // allows groups of attributes
			.text(pa['displayName'])
			.click(function(event)
			{
				self.addAttribute(event.target['id']);
				
				self.notifySignChange($('#' + event.target['id']).attr('iSign'));
			})
			.appendTo(potentialAttributesDiv);
		}
		
		setTimeout // delayed setting of attributes to make sure divs exist for the browser
		(
			function()
			{
				for (var iPa in self.possibleAttributes)
				{
					const pa = self.possibleAttributes[iPa];
					
					if (signData[pa['jsonAttribute']] == pa['jsonValue']) // according to JSON attribute is set
					{
						self.addAttribute('possibleAttribute_' + iPa + '_' + iReading); 
					}
//					else
//					{
//						self.removeAttribute('currentAttribute_' + iPa + '_' + iReading);
//					}
				}
			},
			
			100
		);
		
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
		$('#addReadingPseudoButton').appendTo(hidePanel);
//		$('#confirmSingleSignChangesButton').appendTo(hidePanel);
//		$('#cancelSingleSignChangesButton').appendTo(hidePanel);
		$('#finishSingleSignChangesButton').appendTo(hidePanel);
		
		const container = $('#singleSignContainer').empty();
		$('#signAndAlternatives').appendTo(container);
		$('#signContext').appendTo(container);
//		$('#confirmSingleSignChangesButton').appendTo(container);
//		$('#cancelSingleSignChangesButton').appendTo(container);
		$('#finishSingleSignChangesButton').appendTo(container);
		
		const signsDiv = 
		$('#signAndAlternatives')
		.empty(); // reset displayed main sign & variants
		
		const signData = model['lines'][iLine]['signs'][iSign];
		
		
		/** main sign & variants */
		
		this.createSignElement
		(
			0, // TODO maybe keep position in line for saving, same for variants
			signId,
			signData,
			true
		)
		.appendTo(signsDiv);
		
		$('<span></span>')
		.addClass('signDescription')
		.text('(default)')
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
			for (var iVariant in signData['alternatives'])
			{
				this.createSignElement
				(
					iVariant + 1,
					signId,
					signData['alternatives'][iVariant],
					false
				)
				.appendTo(signsDiv);
				
				$('<span></span>')
				.addClass('signDescription')
				.text('(alternative)')
				.appendTo(signsDiv);
				
				attributesDiv = this.createAttributesDiv(iVariant + 1);
				
				this.createAuthorsDiv
				(
					iVariant + 1,
					signData['alternatives'][iVariant]
				)
				.appendTo(attributesDiv);
				
				this.createAttributesLists
				(
					iVariant + 1,
					signData['alternatives'][iVariant]
				)
				.appendTo(attributesDiv);
				
				// TODO sign owner list
			}
		}
		
		$('#addReadingPseudoButton').appendTo(signsDiv);
		
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
		/* TODO replace by instant saving
		 * 
		 * on:
		 * 
		 * changing line name
		 * adding line
		 * removing line
		 * 
		 * introducing new reading
		 * changing attribute lists
		 * 
		 */
		
		// show currently chosen sign
		
		
		
		
		
		
		
		
		
//		var index = 0;
//		var possibleReading = $('#possibleReading0');
//		
//		while (possibleReading.length > 0)
//		{
//			if (possibleReading.hasClass('modifiedSign'))
//			{
//				var json = '{"mainSignId":';
//				json += possibleReading.attr('mainSignId');
//				
//				// TODO saubere transformation bei nichtbuchstaben
//				json += ',"sign":"' + $('#reading0').text() + '"';
//				
//				const width = $('#widthInput' + index).val();
//				if (width != null
//				&&  width != ''
//				&&  width == 1 * width) // width is a number
//				{
//					json += ',"width":' + width;
//				}
//				else // user might remove the previous width entry
//				{
//					json += ',"width":1';
//				}
//				
//				const commentary = $('#commentInput' + index).val();
//				if (commentary != null
//				&&  commentary != '')
//				{
//					json += ',"commentary":"' + commentary + '"';
//				}
//				else // user can remove commentary
//				{
//					json += ',"commentary":""';
//				}
//				
//				// TODO streamline based on big array (which might belong to spider)
//				if ($('#currentAttribute_atLeast_true_' + index).css('display') != 'none')
//				{
//					json += ',"mightBeWider":1';
//				}
//				if ($('#currentAttribute_position_leftMargin_' + index).css('display') != 'none')
//				{
//					json += ',"position":"LEFT_MARGIN"';
//				}
//				if ($('#currentAttribute_position_rightMargin_' + index).css('display') != 'none')
//				{
//					json += ',"position":"RIGHT_MARGIN"';
//				}
//				if ($('#currentAttribute_position_aboveLine_' + index).css('display') != 'none')
//				{
//					json += ',"position":"ABOVE_LINE"';
//				}
//				if ($('#currentAttribute_position_belowLine_' + index).css('display') != 'none')
//				{
//					json += ',"position":"BELOW_LINE"';
//				}
//				if ($('#currentAttribute_reconstructed_true_' + index).css('display') != 'none')
//				{
//					json += ',"reconstructed":1';
//				}
//				if ($('#currentAttribute_corrected_overwritten_' + index).css('display') != 'none')
//				{
//					json += ',"corrected":"OVERWRITTEN"';
//				}
//				if ($('#currentAttribute_retraced_true_' + index).css('display') != 'none')
//				{
//					json += ',"retraced":1';
//				}
//				
//				json += '}';
//				
//				console.log('json to save ' + json);
//				
//				Spider.requestFromServer
//				(
//					{
//						'request': 'potentiallySaveNewVariant',
//						'variant': json,
//						'user': _user // TODO
//					}
//				);
//			}
//			
//			index++;
//			possibleReading = $('#possibleReading' + index);
//		}
	}
}