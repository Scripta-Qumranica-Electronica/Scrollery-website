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














};