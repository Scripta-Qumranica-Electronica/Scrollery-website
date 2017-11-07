function RichTextEditor()
{
	const self = this; // for usage in event listener
	this.originalText = []; // TODO rename since now modified after DB change
	
	this.fontSize = 20;
	$('#richTextContainer').css({ 'font-size': this.fontSize + 'px' });
	
	this.signVisualisation = new SignVisualisation();
	this.singleSignEditor = new SingleSignEditor(this);
	
	
	/* button listeners */
	
	$('#richTextUndoAll').click(function()
	{
		self.displayModel(self.originalText); // model isn't changed after loading => simply reload it
	});
	
	$('#richTextLineManager').click(function()
	{
		if (Spider.unlocked == false)
		{
			return;
		}
		
		const manager = $('#richTextLineManager');
		
		if (manager.attr('activated') != 1) // null or 0 => activate line management
		{
			$('.addLineByUser').show();
			$('.removeLineByUser').show();
			$('.lineName').attr('contentEditable', 'true');
			
			manager.attr('activated', 1);
		}
		else // deactivate line management
		{
			$('.addLineByUser').hide();
			$('.removeLineByUser').hide();
			$('.lineName').attr('contentEditable', 'false');
			
			manager.attr('activated', 0);
		}
	});
	
	
	/* methods */
	
	this.removeTextLineByUser = function(event)
	{
		if (Spider.unlocked == false)
		{
			return;
		}
		
		const lineNumber = 1 * event.target.id.replace('removeLine', '');
		$('#line' + lineNumber).remove();
		
		for (var iLineNumber = lineNumber + 1; $('#line' + iLineNumber).length > 0; iLineNumber++) // decrement the indexes of each line behind the removed one
		{
			const newNumber = iLineNumber - 1;
			
			$('#line'            + iLineNumber).attr('id', 'line'            + newNumber);
			$('#lineName'        + iLineNumber).attr('id', 'lineName'        + newNumber);
			$('#rightMargin'     + iLineNumber).attr('id', 'rightMargin'     + newNumber);
			$('#regularLinePart' + iLineNumber).attr('id', 'regularLinePart' + newNumber);
			$('#leftMargin'      + iLineNumber).attr('id', 'leftMargin'      + newNumber);
			$('#removeLine'      + iLineNumber).attr('id', 'removeLine'      + newNumber);
			$('#addLineAfter'    + iLineNumber).attr('id', 'addLineAfter'    + newNumber);
		}
	}

	this.addTextLineByUser = function(event)
	{
		if (Spider.unlocked == false)
		{
			return;
		}
		
		const previousLineNumber = 1 * event.target.id.replace('addLineAfter', '');
		
		
		/** move lines after the upcoming new one by 1 index */
		
		var lineNumber = previousLineNumber + 1;
		var followingLine = $('#line' + lineNumber);
		var maxNumber = -1;
		while (followingLine.length > 0) // find last line (going backwards avoids index collision)
		{
			maxNumber = lineNumber;
			console.log('maxNumber ' + maxNumber);
			
			lineNumber++;
			followingLine = $('#line' + lineNumber);
		}
		
		if (maxNumber != -1)
		{
			for (var iLineNumber = maxNumber; iLineNumber > previousLineNumber; iLineNumber--) // increment the indexes of each line behind the upcoming new one
			{
				const newNumber = iLineNumber + 1;
				
				$('#line'            + iLineNumber).attr('id', 'line'            + newNumber);
				$('#lineName'        + iLineNumber).attr('id', 'lineName'        + newNumber);
				$('#rightMargin'     + iLineNumber).attr('id', 'rightMargin'     + newNumber);
				$('#regularLinePart' + iLineNumber).attr('id', 'regularLinePart' + newNumber);
				$('#leftMargin'      + iLineNumber).attr('id', 'leftMargin'      + newNumber);
				$('#removeLine'      + iLineNumber).attr('id', 'removeLine'      + newNumber);
				$('#addLineAfter'    + iLineNumber).attr('id', 'addLineAfter'    + newNumber);
			}
		}
		
		
		/** try to determine line name automatically */
		
		const previousName = $('#lineName' + previousLineNumber).text();
		
		var name = '?';
		if (previousName * 1 == previousName) // name is number
		{
			name = (previousName * 1) + 1; // increment the number (might collide with following line, scholar must handle that)
		}
		else
		{
			const lastCharCode = previousName.substr(previousName.length() - 1).charCodeAt(0);
			
			if ((lastCharCode > 96 && lastCharCode < 123)
			||  (lastCharCode > 64 && lastCharCode <  91)) // previous name ends with a to y OR A .. Y 
			{
				name = previousName.substr(0, previousName.length() - 1) + String.fromCharCode(lastCharCode + 1);
			}
		}
		
		
		/** add new line */
		
		const number = previousLineNumber + 1;
		
		$('#line' + previousLineNumber)
		.after
		(
			self.addTextLine
			(
				number,
				name
			)
		);
		
		$('#removeLine'   + number).show();
		$('#addLineAfter' + number).show();
	}

	this.addTextLine = function(number, name)
	{
		const line =
		$('<tr></tr>')
		.attr('id', 'line' + number)
		.addClass('richTextLine')
		.appendTo('#richTextContainer');
		
		$('<td></td>')
		.attr('id', 'lineName' + number)
		.addClass('lineName')
		.text(name)
		.appendTo(line);

		$('<td></td>')
		.attr('id', 'rightMargin' + number)
		.attr('contentEditable', 'false')
		.addClass('lineSection')
		.addClass('coyBottomBorder')
		.appendTo(line);

		$('<td></td>')
		.attr('id', 'regularLinePart' + number)
		.attr('contentEditable', 'false') // TODO reactivate later, also for margins
		.addClass('lineSection')
		.addClass('normalBottomBorder')
		.appendTo(line);
		
		$('<td></td>')
		.attr('id', 'leftMargin' + number)
		.attr('contentEditable', 'false')
		.addClass('lineSection')
		.addClass('coyBottomBorder')
		.appendTo(line);
		
		$('<td></td>')
		.text('–')
		.attr('id', 'removeLine' + number)
		.attr('title', 'Remove this line')
		.addClass('removeLineByUser')
		.hide()
		.click(function(event)
		{
			self.removeTextLineByUser(event)
		})
		.appendTo(line);
		
		$('<td></td>')
		.text('+')
		.attr('id', 'addLineAfter' + number)
		.attr('title', 'Add a line after this one')
		.addClass('addLineByUser')
		.hide()
		.click(function(event)
		{
			self.addTextLineByUser(event)
		})
		.appendTo(line);
		
		return line;
	}

	this.addSign = function(model, iLine, iSign)
	{
		const attributes = model['lines'][iLine]['signs'][iSign];
		
		var span =
		$('<span></span')
		.attr('id', 'span_' + iLine + '_' + iSign) // only for identification, not for data transport
		.attr('iLine', iLine)
		.attr('iSign', iSign)
		.attr('signId', attributes['signId']);
		
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
			var sign = this.signVisualisation.placeholder([attributes['type']]);
			
			span.attr('title', 'Sign type: ' + this.signVisualisation.typeName(attributes['type'])); // set tooltip
			
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
		
		var destination = $('#regularLinePart' + iLine);
		if (attributes['position'] != null) // chapter 5
		{
			const pos = attributes['position'][0]['position']; // TODO support multiple levels
			
			if (pos == 'aboveLine'
			||  pos == 'belowLine')
			{
				span.addClass(pos);
			}
			else // leftMargin / rightMargin
			{
				destination = $('#' + pos + iLine);
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
			span.addClass('retraced');
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
		
		if ((attributes['reconstructed']) == 1) // 10
		{
			span.addClass('reconstructed');
		}
		
		if ((attributes['corrected']) != null) // 11
		{
			if (typeof attributes['corrected'] == 'string') // one correction only
			{
				span.addClass(attributes['corrected'].toLowerCase());
			}
			else if (typeof attributes['corrected'] == 'object') // multiple
			{
				for (var i in attributes['corrected'])
				{
					span.addClass(attributes['corrected'].toLowerCase());
				}
			}
		}
		
//		if ((attributes['suggested']) != null) // 13.1
//		{
//			span.addClass('suggested');
//		}
		
//		if ((attributes['comment']) != null) // 13.2
//		{
//			span.attr('title', 'Comment: ' + attributes['comment']);
//		}
		
		// TODO vocalization (8)

		span.dblclick(function(event) // TODO just one listener for whole frame
		{
			$('#richTextContainer').appendTo('#hidePanel');
			$('#singleSignContainer').appendTo('#RichTextPanel');
			$('#singleSignContainer').show();
			
			self
			.singleSignEditor
			.displaySingleSignSpan
			(
				self.originalText, // TODO respect user's changes
				event.target['id']
			);
		});
	}
	
	this.displayModel = function(model)
	{
		this.originalText = model;
		
		$('#richTextContainer').appendTo('#RichTextPanel'); // switch back from single sign editor, if necessary
		$('#singleSignContainer').appendTo('#hidePanel');
		
		const buttons = $('#richTextButtons');
		const fragmentName = $('#fragmentName');
		const hidePanel = $('#hidePanel');
		const container = $('#richTextContainer');
		
		buttons.appendTo(hidePanel);
		fragmentName.appendTo(hidePanel);
		container.empty();
		fragmentName.text(model['fragmentName']); // TODO use Spider.current_combination ?
		fragmentName.appendTo(container);
		
		var lastMainSign;
		
		for (var iLine in model['lines'])
		{
			this.addTextLine(iLine, model['lines'][iLine]['lineName']);
			
			for (var iSign in model['lines'][iLine]['signs'])
			{
				const sign = model['lines'][iLine]['signs'][iSign];
				
				if (sign['isVariant'] == 1) // TODO test
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
		
		buttons.appendTo(container);
	}
}

// TODO add context menus based on example of fragmentPuzzle.js