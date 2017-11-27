function FragmentTextModel()
{
	this.lineNames = [];
	this.signs = [];

	this.setFragment = function(json) // transform JSON to object with less hierarchy
	{
		this.fragmentName = json.fragmentName;
		this.lineNames.length = 0; // emptying allows other objects to keep their reference to lineNames
		this.signs.length = 0;

		const lines = json['lines'];
		for (var iLine in lines)
		{
			const line = lines[iLine];
			this.lineNames.push(line['lineName']);
			this.signs.push([]);

			for (var iSign in line['signs'])
			{
				const sign = line['signs'][iSign];
				this.signs[iLine].push({});

				for (var attribute in sign)
				{
					if (attribute == 'corrected'
					&&  typeof sign[attribute] == 'string') // happens for a single correction => normalize to array
					{
						this.signs[iLine][iSign][attribute] = [sign[attribute]];
					}
					else
					{
						this.signs[iLine][iSign][attribute] = sign[attribute];
					}
				}
			}
		}
	};

	this.getAlternativeReadings = function(iLine, iSign)
	{
		const line = this.signs[iLine];
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

		for (var i = iSign + 1; i < line.length; i++) // check for later variant readings
		{
			if (line[i]['signId'] != signId)
			{
				break;
			}

			alternatives.push(i);
		}

		return alternatives;
	};

	this.addAttribute = function(json, signData, attribute, value)
	{
		if (attribute == 'position')
		{
			if (json['signPositionId'] == null
			||  json['level'] == null)
			{
				return false;
			}

			if (signData[attribute] == null)
			{
				signData[attribute] = [];
			}
			signData[attribute].push
			({
				'signPositionId': json['signPositionId'],
				'level'         : json['level'],
				'position'      : value
			});
		}
		else if (attribute == 'corrected')
		{
			if (json['signCharReadingDataId'] == null)
			{
				return false;
			}

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

		return true;
	};

	this.removeAttribute = function(json, signData, attribute, value)
	{
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
				return false;
			}

			signData[attribute] = Array.concat
			(
				signData[attribute].slice(0, posArrayIndex),
				signData[attribute].slice(posArrayIndex + 1)
			);
		}
		else if (attribute == 'corrected')
		{
			const removalIndex = signData[attribute].indexOf(value);
			if (removalIndex != -1)
			{
				signData[attribute] = signData[attribute].slice(0, removalIndex).concat(
									  signData[attribute].slice(removalIndex + 1));
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

		return true;
	};

	this.addSignAfter = function(signData, iLine, iSign)
	{
		const line = this.signs[iLine];
		for (var i = line.length - 1; i > iSign; i--)
		{
			line[i + 1] = line[i];
		}
		line[iSign] = signData;
	};


	// TODO delete sign method
}