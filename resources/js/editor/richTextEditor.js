function RichTextEditor()
{
	const self = this; // for usage in event listener
	
	this.signType2Visualisation =
	{
		2: ' ',
		3: '.',
		4: '_',
		5: '#',
		6: '¬',
		7: '¶',
		8: '?'
	}
	
	this.fontSize = 20;
	
	this.singleSignEditor = new SingleSignEditor(this);
	
	this.addFragmentName = function(name) // TODO currently not used
	{
		$('<span></span>') // TODO id?
		.addClass('fragmentName')
		.text(name)
		.appendTo('#richTextContainer');
	}

	this.addTextLine = function(number, name)
	{
		const line =
		$('<tr></tr>')
		.attr('id', 'line' + number)
		.addClass('line')
		.appendTo('#richTextContainer');
		
		$('<td></td>')
		.attr('id', 'lineName' + number)
		.text(name)
		.appendTo(line);

		$('<td></td>')
		.attr('id', 'rightMargin' + number)
		.attr('contentEditable', 'true')
		.addClass('lineSection')
		.addClass('coyBottomBorder')
		.appendTo(line);

		$('<td></td>')
		.attr('id', 'regularLinePart' + number)
		.attr('contentEditable', 'true')
		.addClass('lineSection')
		.addClass('normalBottomBorder')
		.appendTo(line);
		
		$('<td></td>')
		.attr('id', 'leftMargin' + number)
		.attr('contentEditable', 'true')
		.addClass('lineSection')
		.addClass('coyBottomBorder')
		.appendTo(line);
	}

	this.addSign = function(model, iLine, iSign)
	{
		const attributes = model[iLine]['signs'][iSign];
		
		var span =
		$('<span></span')
		.attr('id', 'span_' + iLine + '_' + iSign) // only for identification, not for data transport
		.attr('iLine', iLine)
		.attr('iSign', iSign)
		.attr('signId', attributes['signId']);
		
		const classList = [];
		
		// chapter 2 & 3
		if (attributes['type'] == null) // letter
		{
			span.text(attributes['sign']);
			
			const w = attributes['width'];
			if (w != null
			&&  w != 1)
			{
				span.css
				({
					'font-size': Math.ceil(this.fontSize * w) + 'px'
				});
			}
		}
		else // not a letter
		{
			var sign = this.signType2Visualisation[attributes['type']];
			
			if (sign == null) // unknown sign type
			{
				sign = '?';
			}
			else
			{
				span.attr('title', 'Sign type: ' + attributes['type']); // tooltip			
				
				if (attributes['width'] == null)
				{
					span
					.text(sign)
					.css
					({
						'font-size': this.fontSize + 'px'
					});
				}
				else
				{
					var markers = sign;
					for (var iSpace = 1; iSpace < Math.floor(attributes['width']); iSpace++)
					{
						markers += sign;
					}
					sign = markers;
					
					span
					.text(markers)
					.css
					({
						'font-size': Math.ceil((this.fontSize * attributes['width']) / markers.length) + 'px'
					});
				}
			}
		}
		
		var destination;
		if (attributes['position'] == null) // chapter 5
		{
			destination = $('#regularLinePart' + iLine);
		}
		else // TODO stacking positions => check api output
		{
			switch (attributes['position'])
			{
				case 'aboveLine':
				{
					span.html('<sup>' + span.html() + '</sup>');
					destination = $('#regularLinePart' + iLine);
				}
				break;
				
				case 'belowLine':
				{
					span.html('<sub>' + span.html() + '</sub>');
					destination = $('#regularLinePart' + iLine);
				}
				break;
				
				case 'leftMargin':
				{
					destination = $('#leftMargin' + iLine);
				}
				break;
				
				case 'rightMargin':
				{
					destination = $('#rightMargin' + iLine);
				}
				break;
			}
		}
		span.appendTo(destination);
		
		if (attributes['isVariant'] == 1)
		{
			span.hide();
			// TODO reference to main sign? reference from it?
		}
		
		if ((attributes['retraced']) == 1) // 6.2
		{
			classList.push('retraced');
		}
		
		if ((attributes['readability']) != null) // 9
		{
			if ((attributes['readability']) == 'INCOMPLETE_AND_NOT_CLEAR')
			{
				span.text(span.text() + '\u05af');
			}
			else if ((attributes['readability']) == 'INCOMPLETE_BUT_CLEAR')
			{
				span.text(span.text() + '\u05c4');
			}
		}
		
		if ((attributes['reconstructed']) == 'true') // 10
		{
			classList.push('reconstructed');
		}
		
		if ((attributes['corrected']) != null) // 11
		{
			classList.push('corrected'); // TODO differentiate by different corrections?
		}
		
//		if ((attributes['suggested']) != null) // 13.1
//		{
//			classList.push('suggested');
//		}
		
//		if ((attributes['comment']) != null) // 13.2
//		{
//			span.attr('title', 'Comment: ' + attributes['comment']);
//		}
		
		// TODO vocalization (8)

		for (var i in classList)
		{
			span.addClass(classList[i]);
		}
		
		span.dblclick(function(event) // TODO just one listener for whole frame
		{
			$('#richTextContainer').appendTo('#hidePanel');
			$('#singleSignContainer').appendTo('#RichTextPanel');
			$('#singleSignContainer').show();
			
			self
			.singleSignEditor
			.displaySingleSignSpan
			(
				Spider.textObject,
				event.target['id']
			);
		});
	}
	
	this.displayModel = function(model)
	{
		$('#richTextContainer').empty();
		
		var lastMainSign;
		
		for (var iLine in model)
		{
			this.addTextLine(iLine, model[iLine]['lineName']);
			
			for (var iSign in model[iLine]['signs'])
			{
				const sign = model[iLine]['signs'][iSign];
				
				if (sign['isVariant'] == 1)
				{
					if (lastMainSign != null) // null shouldn't happen, but for safety 
					{
						if (lastMainSign['alternatives'] == null) // first variant of this sign
						{
							lastMainSign['alternatives'] = [];
						}
						
						lastMainSign['alternatives'].push(sign);
					}
				}
				else
				{
					lastMainSign = sign;
				}
				
				this.addSign
				(
					model,
					iLine,
					iSign
				);
			}
		}
	}
}

// TODO add context menus based on example of fragmentPuzzle.js