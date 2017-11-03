function SingleSignEditor(richTextEditor)
{
	this.richTextEditor = richTextEditor;
	this.signVisualisation = richTextEditor.signVisualisation;
	const self = this;
	
	$('#addReadingPseudoButton').click(function()
	{
		if (Spider.unlocked == false)
		{
			return;
		}
		
		$('#addReadingPseudoButton').appendTo('#hidePanel');
		
		$('#addReadingInput').val(''); // reset input field 
		$('#addReadingDiv').appendTo('#signReadings');
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
					return;
				}
			}
			
			const iReading = $('.alternativeSign').length;
			const signData = { 'sign': newReading };
			const signsDiv = $('#signReadings');
			
			Spider.requestFromServer
			(
				{
					'request'       : 'addChar',
					'sign'          : newReading,
					'mainSignId'    : $('#reading0').attr('mainSignId'),
					'SCROLLVERSION' : Spider.current_version_id
				},
				function(json) // on result
				{
					if (json['error'] != null)
					{
						console.log("json['error'] " + json['error']);
						return;
					}
					
					reading.attr('signCharId', json['signCharId']);
					
					const linePreview = $('.chosenSignInLine');
					const iLine = linePreview.attr('iLine');
					const iSign = linePreview.attr('iSign');
					
					$('#span_' + iLine + '_' + iSign) // rich text editor equivalent
					.css
					({
						'font-size': Math.ceil(self.richTextEditor.fontSize * width) + 'px'
					});
					
					const signData = self.richTextEditor.originalText['lines'][iLine]['signs'][iSign];
					signData['signCharId'] = json['signCharId'];
					signData['width'] = width;
					
					self.notifySignChange(target['id'].replace('widthInput', ''));
				}
			);

			
			
			
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
		
		$('#addReadingDiv').appendTo('#hidePanel');
		
		$('#addReadingPseudoButton').appendTo('#signReadings');
	});
	
	$('#cancelAddReadingButton').click(function()
	{
		$('#addReadingDiv').appendTo('#hidePanel');
		
		$('#addReadingPseudoButton').appendTo('#signReadings');
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
	 		'jsonAttribute': 'mightBeWider', // for grouping of modifications
	 		'jsonValue'    : 1
	 	},
	 	{
	 		'displayName'  : 'on left margin',
	 		'jsonAttribute': 'position',
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
		
		$('#reading' + index).addClass('modifiedSign'); // TODO remove it once it's back to initial attributes
	};
	
	this.saveWidthChange = function(target)
	{
		if (Spider.unlocked == false)
		{
			return;
		}
		
		var width = target.value;
		if (isNaN(parseFloat(width))) // given value is not a number
		{
			console.log('invalid width: ' + width);
			return;
		}
		
		const readingId = target['id'].replace('widthInput', '');
		const reading = $('#reading' + readingId);
		
		Spider.requestFromServer
		(
			{
				'request'       : 'changeWidth',
				'signCharId'    : reading.attr('signCharId'),
				'width'         : width,
				'SCROLLVERSION' : Spider.current_version_id
			},
			function(json) // on result
			{
				if (json['error'] != null)
				{
					console.log("json['error'] " + json['error']);
					return;
				}
				
				reading.attr('signCharId', json['signCharId']);
				
				const linePreview = $('.chosenSignInLine');
				const iLine = linePreview.attr('iLine');
				const iSign = linePreview.attr('iSign');
				
				$('#span_' + iLine + '_' + iSign) // rich text editor equivalent
				.css
				({
					'font-size': Math.ceil(self.richTextEditor.fontSize * width) + 'px'
				});
				
				const signData = self.richTextEditor.originalText['lines'][iLine]['signs'][iSign];
				signData['signCharId'] = json['signCharId'];
				signData['width'] = width;
				
				self.notifySignChange(target['id'].replace('widthInput', ''));
			}
		);
	}
	
	this.addAttribute = function(possibleAttributeId, doSave)
	{
		if (Spider.unlocked == false
		&&  doSave)
		{
			console.log('Spider.unlocked == false');
			return;
		}
		
		const pa = $('#' + possibleAttributeId);
		if (pa.length == 0)
		{
			console.log('pa.length == 0')
			return;
		}

		const iReading = pa.attr('iReading');
		const attribute = pa.attr('attribute');
		const value = pa.attr('value');
		
//		var signPositionId = $('#reading' + iSign).attr('signPositionId'); // TODO support multiple
//		if (signPositionId == null)
//		{
//			signPositionId = -1;
//		}
		
		var wasChangeSuccessful = true;
		
		if (doSave)
		{
			const reading = $('#reading' + iReading);
			
			Spider.requestFromServer
			(
				{
					'request'       : 'addAttribute',
					'signId'        : reading.attr('signId'),
					'signCharId'    : reading.attr('signCharId'),
					'signCharReadingDataId': reading.attr('signCharReadingDataId'), // might be null
					'signPositionId': reading.attr('signPositionId'), // might be null // TODO support multiple (separate handling of position saving?)
					'attributeName' : attribute,
					'attributeValue': value,
					'SCROLLVERSION' : Spider.current_version_id
				},
				function(json) // on result
				{
					if (json['error'] != null)
					{
						wasChangeSuccessful = false;
						
						return;
					}
					
					const ids =
					[
					 	'signCharId',
					 	'signCharReadingDataId',
					 	'signPositionId'
					];
					for (var i in ids)
					{
						if (json[ids[i]] != null)
						{
							$('#reading' + iReading).attr(ids[i], json[ids[i]]);
						}
					}
				},
				function()
				{
					wasChangeSuccessful = false;
				}
			);
		}
		
		if (!wasChangeSuccessful)
		{
			return;
		}
		
		
		/** adapt attribute entry */
		
		$('.attribute_' + attribute + '_' + iReading)
		.removeClass('attribute')
		.addClass('chosenAttribute')
		.off('click');
		
		$('#' + possibleAttributeId.replace('possibleAttribute', 'currentAttribute')).show();
		
		
		/** adapt previews, rich text editor entry and data */
		
		const linePreview = $('.chosenSignInLine');
		const iLine = linePreview.attr('iLine');
		const iSign = linePreview.attr('iSign');
		
		const rteSign = $('#span_' + iLine + '_' + iSign); // rich text editor equivalent
		const signData = self.richTextEditor.originalText['lines'][iLine]['signs'][iSign];
		
		if (attribute == 'position')
		{
			if (value == 'aboveLine'
			||  value == 'belowLine')
			{
				$('.chosenSign').addClass(value);
				rteSign.addClass(value);
			}
			else // leftMargin / rightMargin
			{
				$('.chosenSignInLine').appendTo('#' + value + iLine + '_cloned');
				rteSign.appendTo('#' + value + iLine);
			}

			if (signData['position'] == null)
			{
				signData['position'] = [{}];
			}
			
			signData['position'][0]['signPositionId'] = $('#reading' + iReading).attr('signPositionId');
			signData['position'][0]['level'         ] = 1; // TODO support multiple levels
			signData['position'][0]['position'      ] = value;
		}
		else
		{
			$('.chosenSign').addClass(attribute); // both preview signs in single sign editor
			rteSign.addClass(attribute);
			
			signData[attribute] = 1;
		}
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
		
		const iReading = ca.attr('iReading');
		const reading = $('#reading' + iReading);
		const attribute = ca.attr('attribute');
		
		const linePreview = $('.chosenSignInLine');
		const iLine = linePreview.attr('iLine');
		const iSign = linePreview.attr('iSign');
		
		var wasChangeSuccessful = true;
		
		Spider.requestFromServer
		(
			{
				'request'       : 'removeAttribute',
				'signId'        : reading.attr('signId'), // TODO likely not necessary
				'signCharId'    : reading.attr('signCharId'),
				'signCharReadingDataId': reading.attr('signCharReadingDataId'), // might be null
				'signPositionId': reading.attr('signPositionId'), // might be null
				// TODO support level of position
				'attributeName' : attribute,
				'SCROLLVERSION' : Spider.current_version_id
			},
			function(json) // on result
			{
				if (json['error'] != null)
				{
					wasChangeSuccessful = false;
					
					return;
				}
				
				const signData = self.richTextEditor.originalText['lines'][iLine]['signs'][iSign];
				
				const ids =
				[
				 	'signCharId',
				 	'signCharReadingDataId',
				 	'signPositionId'
				];
				for (var i in ids)
				{
					if (json[ids[i]] != null)
					{
						$('#reading' + iReading).attr(ids[i], json[ids[i]]);
						
						signData[ids[i]] = json[ids[i]]; // save to text model
					}
				}
			},
			function()
			{
				wasChangeSuccessful = false;
			}
		);
		
		if (!wasChangeSuccessful)
		{
			return;
		}
		
		
		/** adapt attribute entry */
		
		$('.attribute_' + attribute + '_' + iReading)
		.addClass('attribute')
		.removeClass('chosenAttribute')
		.click(function(event)
		{
			self.addAttribute(event.target['id'], true);
		})

		ca.hide();
		
		
		/** adapt previews, rich text editor entry and data */
		
		const rteSign = $('#span_' + iLine + '_' + iSign); // rich text editor equivalent
		const signData = self.richTextEditor.originalText['lines'][iLine]['signs'][iSign];
		
		if (attribute == 'position')
		{
			$('.chosenSign')
			.removeClass('aboveLine')
			.removeClass('belowLine')
			.appendTo('#regularLinePart' + iLine + '_cloned');
			
			rteSign
			.removeClass('aboveLine')
			.removeClass('belowLine')
			.appendTo('#regularLinePart' + iLine);
			
			signData['position'] = null;
		}
		else
		{
			$('.chosenSign').removeClass(attribute); // both preview signs in single sign editor
			rteSign.removeClass(attribute);
			
			signData[attribute] = null;
		}
	};
	
	this.createSignElement = function(iReading, mainSignId, signData, isMainSign)
	{
		const signElement =
		$('<span></span>')
		.attr('id', 'reading' + iReading)
		.attr('signId', signData['signId'])
		.attr('signCharId', signData['signCharId'])
		.attr('signCharReadingDataId', signData['signCharReadingDataId'])
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
			signElement.text(this.signVisualisation.placeholder(signData['type']));
		}
		
		if (signData['isVariant'] == null)
		{
			signElement.addClass('chosenSign');
		}
		else
		{
			signElement.addClass('someSpaceToTheLeft');
			signElement.addClass('otherSign');
		}
		
		if (signData['position'] != null)
		{
			signElement.attr('signPositionId', signData['position'][0]['signPositionId']); // TODO support multiple levels
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
			.addClass('mediumFontSize')
			.addClass('attributesDiv')
			.appendTo('#singleSignContainer');
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
		var signAuthorData =
		$('<div></div>')
		.attr('id', 'signAuthorData' + iReading)
		.addClass('someSpaceBelow');
		
//		const ownersDiv = // TODO
//		$('<div></div>')
//		.attr('id', 'authorsAcceptance' + iReading)
//		.addClass('someSpaceBelow')
//		.text('Reading accepted by: You')
//		.appendTo(signAuthorData);
//		
//		const commentsDiv =
//		$('<div></div>')
//		.attr('id', 'authorsComment' + iReading)
//		.appendTo(signAuthorData);
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
		
		return signAuthorData;
	}
	
	this.createAttributesLists = function(iReading, signData)
	{
		const attributeChoiceContainer =
		$('<div></div>')
		.attr('id', 'attributeChoiceDiv' + iReading);
			
		$('<span></span>')
		.text('Sign width: ')
		.appendTo(attributeChoiceContainer);
		
		var width = '';
		if (signData['width'] != null)
		{
			width = signData['width'];
		}
		
		const widthInput =
		$('<input></input>')
		.attr('id', 'widthInput' + iReading)
		.attr('placeholder', 'Leave empty for standard size')
		.val(width)
		.change(function(event)
		{
			self.saveWidthChange(event.target);
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
			.attr('iReading', iReading)
			.addClass('attribute')
			.text(pa['displayName'])
			.click(function(event)
			{
				self.removeAttribute(event.target['id']);
				
				self.notifySignChange($('#' + event.target['id']).attr('iReading'));
			})
			.hide()
			.appendTo(currentAttributesDiv);
			
			$('<div></div>')
			.attr('id', 'possibleAttribute_' + iPa + '_' + iReading)
			.attr('attribute', pa['jsonAttribute'])
			.attr('value', pa['jsonValue'])
			.attr('iReading', iReading)
			.addClass('attribute')
			.addClass('attribute_' + pa['jsonAttribute'] + '_' + iReading) // allows groups of attributes
			.text(pa['displayName'])
			.click(function(event)
			{
				self.addAttribute(event.target['id'], true);
				
				self.notifySignChange($('#' + event.target['id']).attr('iReading'));
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
					
					if (signData['position'] != null
					&&  pa['jsonAttribute'] == 'position')
					{
						if (signData['position'][0]['position'] == pa['jsonValue']) // according to JSON attribute is set
						{
							self.addAttribute('possibleAttribute_' + iPa + '_' + iReading, false); 
						}
						else
						{
//							self.removeAttribute('currentAttribute_' + iPa + '_' + iReading);
						}
					}
					else // attribute other than position
					{
						if (signData[pa['jsonAttribute']] == pa['jsonValue']) // according to JSON attribute is set
						{
							self.addAttribute('possibleAttribute_' + iPa + '_' + iReading, false); 
						}
						else
						{
//							self.removeAttribute('currentAttribute_' + iPa + '_' + iReading);
						}
					}
				}
			},
			
			100
		);
		
		return attributeChoiceContainer;
	}
	
	this.displaySingleSignSpan = function(model, spanId)
	{
		const span = $('#' + spanId);
		const iLine  = span.attr('iLine');
		const iSign  = span.attr('iSign');
		const signId = span.attr('signId');
		
		
		/** line context */
		
		const signContext = 
		$('#signContext')
		.empty(); // remove previous line context
		
		const line = $('#line' + iLine);
		if (line.length > 0) // line exists (it always should)
		{
			line
			.clone()
			.click(function(event)
			{
				const element = event.target;
				if (element.id.indexOf('span') != 0) // handle only clicks on signs
				{
					return;
				}
				
				self
				.displaySingleSignSpan
				(
					self.richTextEditor.originalText,
					element['id']
				);
			})
			.appendTo('#signContext');
			
			$('#leftMargin' + iLine)
			.attr('id', '#leftMargin' + iLine + '_cloned') // makes rich text editor div's id unique again
			.attr('contentEditable', 'false');
			
			$('#regularLinePart' + iLine)
			.attr('id', '#regularLinePart' + iLine + '_cloned')
			.attr('contentEditable', 'false');
			
			$('#rightMargin' + iLine)
			.attr('id', '#rightMargin' + iLine + '_cloned')
			.attr('contentEditable', 'false');
			
			$('#span_' + iLine + '_' + iSign)
			.attr('id', null) // makes rich text editor span's id unique again 
			.addClass('chosenSign')
			.addClass('chosenSignInLine');
		}
		
		// TODO smoothen reset code?
		
		$('#hidePanel')
		.append($('#signContext'))
		.append($('#signReadings'))
		.append($('#addReadingPseudoButton'))
		.append($('#finishSingleSignChangesButton')); // protect these elements from deletion by empty()
		
		const container =
		$('#singleSignContainer')
		.empty()
		.append($('#signContext'))
		.append($('#signReadings'));
		// buttons will be readded later, at the end of their parent elements
		
		const signsDiv =
		$('#signReadings')
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
		
		
		/** add Done button at the bottom */
		
		container.append($('#finishSingleSignChangesButton'));
	}
}