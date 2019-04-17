function Deck(contents) {
	
	const node = document.getElementById('deck');
	const total = document.getElementById('total');
	
	function updateTotal() {
		total.innerText = contents.length;
	}
	updateTotal();
	
	this.draw = function(e) {
		deselectAll();
		if (contents.length) {
			grab(e, new Card(contents.pop()));
			updateTotal();
		}
	};

	this.putOnBottom = function(data) {
		contents.unshift(data);
		updateTotal();
	};

	this.replace = function(data) {
		contents.unshift(data);
		return contents.pop();
	};

	this.placeGroup = function(x, y, rows, count, sort) {
		let total = Math.min(count, contents.length);
		let popped = contents.splice(-total);
		
		if (sort) {
			popped.sort((a, b) => a.cost - b.cost);
		}
		
		for (let i = 0; i < total; i++) {
			new Card(popped[i]).setPosition(x + Math.floor(i / rows) * CARD_HEIGHT, y + (i % rows) * CARD_WIDTH);
		}
		updateTotal();
	},

	this.shuffle = function() {
		shuffle(contents);
		node.animate([
			{ filter: 'none' },
			{ filter: 'blur(5px)' }, 
			{ filter: 'none' }
		], {
			duration: 600,
			iterations: 1
		});
	};
	
	// drawSearch: function(result) {
		// grab(result.e, new Card(contents.splice(contents.findIndex(c => c.name == result.name), 1)[0]));
		// updateTotal();
	// },
	
	// cheat: function(cardName) {
		// let index = contents.findIndex(c => c.name == cardName);
		// if (index == -1) {
			// throw 'not found';
		// }
		// swap(contents, index, contents.length - 1);
	// };
}
