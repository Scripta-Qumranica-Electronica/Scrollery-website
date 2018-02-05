window.FragmentTextModel = function FragmentTextModel()
{
	this.lineNames = [];
	this.text = [];

	this.setFragment = function(json) // transform JSON to object with less hierarchy
	{
		this.fragmentName = json.fragmentName;
		this.lineNames.length = 0; // emptying allows other objects to keep their reference to lineNames
		this.text.length = 0;

		const lines = json['lines'];
		for (var iLine in lines)
		{
			const line = lines[iLine];
			this.lineNames.push(line['lineName']);
			this.text.push([]);

			for (var iSign in line['signs'])
			{
				const sign = line['signs'][iSign];
				this.text[iLine].push({});

				for (var attribute in sign)
				{
					if (attribute == 'corrected')
					{
						const split = sign[attribute].split(',');

						const correctedArray = [];
						for (var iSplit in split)
						{
							correctedArray.push(split[iSplit]);
						}

						this.text[iLine][iSign][attribute] = correctedArray;
					}
					else
					{
						this.text[iLine][iSign][attribute] = sign[attribute];
					}
				}
			}
		}
	};

	this.getAlternativeReadings = function(iLine, iSign) // TODO move main sign to begin
	{
		const line = this.text[iLine];
		const signId = line[iSign]['signId'];
		const alternatives = [];

		for (var i = iSign - 1; i >= 0; i--) // check for previous variant readings & main sign
		{
			if (line[i]['signId'] != signId)
			{
				break;
			}

			alternatives.push(i);
		}
		alternatives.reverse();

		alternatives.push(iSign);

		for (var i = iSign + 1; i < line.length; i++) // check for later variant readings & main sign
		{
			if (line[i]['signId'] != signId)
			{
				break;
			}

			alternatives.push(i);
		}

		for (var iAlternative in alternatives) // put main sign's iSign as first entry
		{
			if (this.text[iLine][alternatives[iAlternative]]['isVariant'] == null)
			{
				const mainSignIndex = alternatives[iAlternative];
				for (var iArray = iAlternative - 1; iArray >= 0; iArray--)
				{
					alternatives[iArray + 1] = alternatives[iArray];
				}
				alternatives[0] = mainSignIndex;

				break;
			}
		}

		return alternatives;
	};

	this.changeWidth = function(iLine, iSign, signCharId, width)
	{
		this.text[iLine][iSign]['signCharId'] = signCharId;
		this.text[iLine][iSign]['width'] =
		(
			width == 1
			? null
			: width
		);
	};

	this.addAttribute = function(json, iLine, iSign, attribute, value)
	{
		const signData = this.text[iLine][iSign];

		if (attribute == 'position')
		{
			if (signData[attribute] == null)
			{
				this.text[iLine][iSign][attribute] = []; // change from null to [] means losing reference to signData
			}
			this.text[iLine][iSign][attribute].push
			({
				'signPositionId': json['signPositionId'],
				'level'         : json['level'],
				'position'      : value
			});
		}
		else if (attribute == 'corrected')
		{
			signData['signCharReadingDataId'] = json['signCharReadingDataId'];

			if (signData[attribute] == null)
			{
				signData[attribute] = [];
			}
			signData[attribute].push(value);
		}
		else
		{
			if (json['signCharId'] != null)
			{
				signData['signCharId'] = json['signCharId'];
			}
			if (json['signCharReadingDataId'] != null)
			{
				signData['signCharReadingDataId'] = json['signCharReadingDataId'];
			}

			signData[attribute] = value;
		}
	};

	this.removeAttribute = function(json, iLine, iSign, attribute, value)
	{
		const signData = this.text[iLine][iSign];

		if (attribute == 'position')
		{
			const posData = signData[attribute];

			var posArrayIndex = -1;
			for (var iPos = posData.length - 1; iPos >= 0; iPos--)
			{
				if (posData[iPos]['position'] == value)
				{
					posArrayIndex = iPos;

					break;
				}
			}
			if (posArrayIndex == -1)
			{
				return;
			}

			this.text[iLine][iSign][attribute] = Array.concat
			(
				signData[attribute].slice(0, posArrayIndex),
				signData[attribute].slice(posArrayIndex + 1)
			);
		}
		else if (attribute == 'corrected')
		{
			signData['signCharReadingDataId'] = json['signCharReadingDataId'];

			const removalIndex = signData[attribute].indexOf(value);
			if (removalIndex != -1)
			{
				signData[attribute] = Array.concat
				(
					signData[attribute].slice(0, removalIndex),
					signData[attribute].slice(removalIndex + 1)
				);
			}
		}
		else
		{
			if (json['signCharId'] != null)
			{
				signData['signCharId'] = json['signCharId'];
			}
			if (json['signCharReadingDataId'] != null)
			{
				signData['signCharReadingDataId'] = json['signCharReadingDataId'];
			}

			signData[attribute] = null;
		}
	};

	this.addSignAfter = function(signData, iLine, iSign)
	{
		const line = this.text[iLine];
		for (var i = line.length - 1; i > iSign; i--)
		{
			line[i + 1] = line[i];
		}
		line[iSign + 1] = signData;
	};
}