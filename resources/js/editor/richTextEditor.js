function addFragmentName(name)
{
	$('<span></span>') // TODO id?
	.addClass('fragmentName')
	.text(name)
	.appendTo('#richTextContainer');
}

function addTextLine(number, name)
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
//	.attr('contentEditable', 'true') // TODO reactivate later
	.addClass('lineSection')
	.addClass('coyBottomBorder')
	.appendTo(line);

	$('<td></td>')
	.attr('id', 'regularLinePart' + number)
//	.attr('contentEditable', 'true') // TODO reactivate later
	.addClass('lineSection')
	.addClass('normalBottomBorder')
	.appendTo(line);
	
	$('<td></td>')
	.attr('id', 'leftMargin' + number)
//	.attr('contentEditable', 'true') // TODO reactivate later
	.addClass('lineSection')
	.addClass('coyBottomBorder')
	.appendTo(line);
}

function addSign(model, iLine, iAlternative, iSign)
{
	const attributes = model[iLine]['signs'][iAlternative][iSign];
	var sign = attributes['sign'];
	
	var span =
	$('<span></span')
	.attr('id', 'span_' + iLine + '_' + iAlternative + '_' + iSign) // only for identification, not for data transport
	.attr('iLine', iLine)
	.attr('iAlternative', iAlternative)
	.attr('iSign', iSign)
	.attr('signId', attributes['id']);
	
	const classList = [];
	
	/** TODO remaining attributes
	 * alternative (6.1, 7, 9)	-> TODO mark signs with alternatives
	 * vocalization (8)			-> TODO
	 */
	
	// chapter 2 & 3
	if (attributes['signType'] == null) // letter
	{
		span.text(sign);
		
		const w = attributes['width'];
		if (w != null
		&&  w != 1)
		{
			span.css
			({
				'font-size': Math.ceil(14 * w) + 'px'
			});
		}
	}
	else // not a letter
	{
		sign = _signType2Visualisation[attributes['signType']];
		if (sign == null)
		{
			return; // skip breaks
		}
		
		if (sign == null) // unknown sign type
		{
			sign = '?';
		}
		else
		{
			span.attr('title', 'Sign type: ' + attributes['signType']); // tooltip			
			
			if (attributes['width'] == null)
			{
				span
				.text(sign)
				.css
				({
					'font-size': '14px'
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
					'font-size': Math.ceil((14 * attributes['width']) / markers.length) + 'px'
				});
			}
		}
	}
	
	var destination;
	if (attributes['position'] == null) // chapter 5
	{
		destination = $('#regularLinePart' + iLine);
	}
	else // TODO stacking positions
	{
		switch (attributes['position'])
		{
			case 'ABOVE_LINE':
			{
				span.html('<sup>' + span.html() + '</sup>');
				destination = $('#regularLinePart' + iLine);
			}
			break;
			
			case 'BELOW_LINE':
			{
				span.html('<sub>' + span.html() + '</sub>');
				destination = $('#regularLinePart' + iLine);
			}
			break;
			
			case 'LEFT_MARGIN':
			{
				destination = $('#leftMargin' + iLine);
			}
			break;
			
			case 'RIGHT_MARGIN':
			{
				destination = $('#rightMargin' + iLine);
			}
			break;
		}
	}
	span.appendTo(destination);
	
	
	if ((attributes['retraced']) == 1) // 6.2
	{
		classList.push('retraced');
	}
	
	if ((attributes['damaged']) != null) // 9
	{
		if ((attributes['damaged']) == 'INCOMPLETE_AND_NOT_CLEAR')
		{
			span.text(span.text() + '\u05af');
		}
		else if ((attributes['damaged']) == 'INCOMPLETE_BUT_CLEAR')
		{
			span.text(span.text() + '\u05c4');
		}
	}
	
	if ((attributes['reconstructed']) == 1) // 10
	{
		classList.push('reconstructed');
	}
	
	if ((attributes['corrected']) != null) // 11
	{
		classList.push('corrected'); // TODO differentiate by different corrections?
	}
	
	if ((attributes['suggested']) != null) // 13.1
	{
		classList.push('suggested');
	}
	
	if ((attributes['comment']) != null) // 13.2
	{
		span.attr('title', 'Comment: ' + attributes['comment']);
	}
	
	for (var i in classList)
	{
		span.addClass(classList[i]);
	}
	
	span.dblclick(function(event)
	{
		$('#richTextContainer').appendTo('#hidePanel');
		$('#singleSignContainer').appendTo('#RichTextPanel');
		
		displaySingleSignSpan(Spider.textObject, event.target['id']);
	});
}

function displayModel(model)
{
	$('#richTextContainer').empty();
	
	for (var iLine in model)
	{
		addTextLine(iLine, model[iLine]['lineName']);
		
		for (var iAlternative in model[iLine]['signs'])
		{
			addSign
			(
				model,
				iLine,
				iAlternative,
				0
			);
		}
	}
}

// TODO add context menus based on example of fragmentPuzzle.js

var _signType2Visualisation;

function initRichTextEditor()
{
	_signType2Visualisation =
	{
		'space':			' ',
		'possible vacat':	'.',
		'vacat':			'_',
		'damage':			'#',
		'blank line':		'¬',
		'paragraph marker':	'¶',
		'lacuna':			'?'
	}
}