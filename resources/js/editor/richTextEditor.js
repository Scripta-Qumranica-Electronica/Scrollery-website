function addFragmentName(name)
{
	$('<span></span>') // TODO id?
	.attr('contentEditable', 'true') // TODO worth the trouble?
	.addClass('fragmentName')
	.text(name)
	.appendTo('#richTextContainer');
}

function addTextLine(number)
{
	const line =
	$('<tr></tr>')
	.addClass('line')
	.appendTo('#richTextContainer');
	
	$('<td></td>')
	.attr('id', 'lineNumber' + number)
	.text(number)
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

function addSign(sign, attributes, lineNumber, iAlternative, iSign)
{
	var span = $('<span></span');
	span.attr('id', 'span' + iAlternative + '_' + iSign);
	
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
		destination = $('#regularLinePart' + lineNumber);
	}
	else // TODO stacking positions
	{
		switch (attributes['position'])
		{
			case 'ABOVE_LINE':
			{
				span.html('<sup>' + span.html() + '</sup>');
				destination = $('#regularLinePart' + lineNumber);
			}
			break;
			
			case 'BELOW_LINE':
			{
				span.html('<sub>' + span.html() + '</sub>');
				destination = $('#regularLinePart' + lineNumber);
			}
			break;
			
			case 'LEFT_MARGIN':
			{
				destination = $('#leftMargin' + lineNumber);
			}
			break;
			
			case 'RIGHT_MARGIN':
			{
				destination = $('#rightMargin' + lineNumber);
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
		$('#singleSignContainer').appendTo('#richTextPanel');
		
		displaySingleSignSpan(event.target['id'], Spider.textObject);
	});
}

function displayModel(model)
{
	var sign;
	var attributes;
	var lineNumber;
	
	var highestLineIndex = 0;
	
	for (var iAlternative in model)
	{
		for (var iSign in model[iAlternative]) // TODO dont display alternatives in a row
		{
			sign = model[iAlternative][iSign]['sign'];
			if (sign == null)
			{
				sign = '?';
			}
			
			attributes = {};
			for (var a in model[iAlternative][iSign])
			{
				if (a != 'sign'
				&&  a != 'line')
				{
					attributes[a] = model[iAlternative][iSign][a];
				}
			}
			
			lineNumber = model[iAlternative][iSign]['line'];
			if (lineNumber == null)
			{
				lineNumber = 1;
			}
			while (lineNumber > highestLineIndex)
			{
				addTextLine(highestLineIndex + 1);
				highestLineIndex++;
			}

			addSign
			(
				sign,
				attributes,
				lineNumber,
				iAlternative,
				iSign
			);
		}
	}
}

function displayModel2(model)
{
	$('#richTextContainer').empty();
	
	// TODO add fragment name?
	
	for (var iLine in model)
	{
		addTextLine(model[iLine]['lineName']);
		
		for (var iAlternative in model[iLine]['signs'])
		{
			var a = model[iLine]['signs'][iAlternative];
			
			for (var iSign in a)
			{
				addSign
				(
					a[iSign]['sign'],
					a[iSign],
					model[iLine]['lineName'],
					iAlternative,
					iSign
				);
			}
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