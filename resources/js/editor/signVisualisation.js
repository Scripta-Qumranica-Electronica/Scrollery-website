function SignVisualisation()
{
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
	}

	this.typeName = function(typeId)
	{
		var typeName = this.signType2Name[typeId];
		if (typeName == null)
		{
			typeName = 'unknown';
		}
		
		return typeName;
	}

	// TODO reconstructed etc.
	// TODO sign attributes including corrections?

	this.repositionChar = function(iLine, iSign, positionData, span)
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

			// const signsOnRegularLine = $('#regularLinePart' + iLine).children();
			// var inserted = false;
			//
			// for (var i in signsOnRegularLine)
			// {
			// 	if (signsOnRegularLine[i]['attributes']['isign']['nodeValue'] * 1 > iSign)
			// 	{
			// 		linePreview.insertBefore('#' + signsOnRegularLine[i]['id']);
			// 		inserted = true;
			//
			// 		break;
			// 	}
			// }
			//
			// if (!inserted) // iSign is higher than any in line
			// {
			// 	linePreview.appendTo('#regularLinePart' + iLine);
			// }
	};











};