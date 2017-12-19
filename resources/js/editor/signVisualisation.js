function SignVisualisation()
{
	this.fontSize = 20; // TODO move all of rte's dependence on font size to here

	this.signType2Visualisation =
	{
		2: ' ',
		3: '.',
		4: '_',
		5: '#',
		6: '¬',
		7: '¶',
		8: '?'
	};
	this.signType2Name =
	{
		2: 'space',
		3: 'possible vacat',
		4: 'vacat',
		5: 'damage',
		6: 'blank line',
		7: 'paragraph marker',
		8: 'lacuna'
	};

	this.placeholder = function(typeId)
	{
		var placeholder = this.signType2Visualisation[typeId];
		if (placeholder == null)
		{
			placeholder = '?';
		}
		
		return placeholder;
	};

	this.typeName = function(typeId)
	{
		var typeName = this.signType2Name[typeId];
		if (typeName == null)
		{
			typeName = 'unknown';
		}
		
		return typeName;
	};

	this.changeWidthOfSpan = function(span, width)
	{
		span.css
		({
			// 'transform': 'scaleX(' + width + ')'
			'font-size': Math.ceil(this.fontSize * width) + 'px'
		});
	};

	this.changeWidth = function(iLine, iSign, width)
	{
		this.changeWidthOfSpan($('#span_' + iLine + '_' + iSign), width);
	};

	this.repositionChar = function(iLine, iSign, positionData, span, addToEndOfLine)
	{
		var verticalPositionInLine = null;
		var horizontalMargin = null;
		var verticalMargin = null;

		span
		.removeClass('aboveLine')
		.removeClass('belowLine');

		for (var iPos in positionData)
		{
			var pos = positionData[iPos]['position'];

			if (verticalPositionInLine == null)
			{
				if (pos == 'aboveLine'
				||  pos == 'belowLine')
				{
					span.addClass(pos);
					verticalPositionInLine = pos;
				}
			}

			if (horizontalMargin == null)
			{
				if (pos == 'margin')
				{
					pos = 'leftMargin';
				}

				if (pos == 'leftMargin'
				||  pos == 'rightMargin')
				{
					if (verticalMargin == null)
					{
						span.appendTo('#' + pos + iLine);
					}
					else
					{
						span.appendTo('#' + pos + '_' + verticalMargin);
					}

					horizontalMargin = pos;
				}
			}

			if (verticalMargin == null)
			{
				if (pos == 'upperMargin'
				||  pos == 'lowerMargin')
				{
					if (horizontalMargin == null)
					{
						span.appendTo('#regularLinePart_' + pos);
					}
					else
					{
						span.appendTo('#' + horizontalMargin + '_' + pos);
					}

					verticalMargin = pos;
				}
			}
		}

		if (horizontalMargin == null
		&&  verticalMargin == null)
		{
			if (addToEndOfLine != null
			&&  addToEndOfLine == true)
			{
				span.appendTo('#regularLinePart' + iLine);
			}
			else
			{
				const signsOnRegularLine = $('#regularLinePart' + iLine).children();
				var inserted = false;

				for (var i in signsOnRegularLine)
				{
					if (i == 'length') // length follows after actual children
					{
						break;
					}

					if (signsOnRegularLine[i]['attributes']['iSign']['value'] * 1 > iSign)
					{
						span.insertBefore('#' + signsOnRegularLine[i]['id']);
						inserted = true;

						break;
					}
				}

				if (!inserted) // iSign is higher than any in line
				{
					span.appendTo('#regularLinePart' + iLine);
				}
			}
		}
	};

	this.addAttribute = function(iLine, iSign, iReading, attribute, value, positionData, possibleAttributeId)
	{
		const charInLine = $('#span_' + iLine + '_' + iSign);

		if (attribute == 'position')
		{
			this.repositionChar
			(
				iLine,
				iSign,
				positionData,
				charInLine
			);

			var ca = $('#' + possibleAttributeId.replace('possibleAttribute', 'currentAttribute'));
			if (ca.is(':visible')) // this position was already chosen at least once
			{
				const previousText = ca.text();
				const amountIndex = previousText.indexOf('^'); // assumes there is no ^ in position value name

				if (amountIndex == -1) // was chosen exactly once so far
				{
					ca.text(previousText + '^2');
				}
				else // was chosen more than once already
				{
					const newIndex = (1 * previousText.substr(amountIndex + 1)) + 1;

					ca.text(previousText.substr(0, amountIndex + 1) + newIndex);
				}
			}
			else
			{
				ca.show();
			}
		}
		else if (attribute == 'corrected')
		{
			charInLine.addClass(value);
			$('#reading' + iReading).addClass(value);

			$('#' + possibleAttributeId).hide();
			$('#' + possibleAttributeId.replace('possibleAttribute', 'currentAttribute')).show();
		}
		else // any attribute but position or corrected
		{
			charInLine.addClass(attribute);
			$('#reading' + iReading).addClass(attribute);

			$('#' + possibleAttributeId).hide();
			$('#' + possibleAttributeId.replace('possibleAttribute', 'currentAttribute')).show();
		}
	};

	// TODO reconstructed, corrections etc.
}