function Deck(contents) {
	
	const deckNameNode = document.getElementById('deckName');
	
	function updateTotal() {
		deckNameNode.innerText = `Deck (${contents.length})`;
	}
	updateTotal();
	
	this.draw = function(event) {
		deselectAll();
		if (contents.length) {
			grab(event, drawTile(event.shiftKey ? contents.shift() : contents.pop()));
			updateTotal();
		}
	};

	this.putOnBottom = function(card) {
		contents.unshift(card);
		updateTotal();
	};

	this.replace = function(card) {
		contents.unshift(card);
		return contents.pop();
	};
	
	this.replaceBottom = function(card) {
		contents.push(card);
		return contents.shift();
	};

	this.placeGroup = function(x, y, rows, count, sort) {
		let total = Math.min(count, contents.length);
		let popped = contents.splice(-total);
		
		if (sort) {
			popped.sort((a, b) => a.cost - b.cost);
		}
		for (let i = 0; i < total; i++) {
			generateTile(popped[i], x + Math.floor(i / rows) * TILE_HEIGHT, y + (i % rows) * TILE_WIDTH);
		}
		updateTotal();
	};
	
	const rotateFrames = 16;
	let frames = [];
	for (let i = 0; i < rotateFrames; i++) {
		frames.push({transform: `rotate(${(rotateFrames - i) * (i % 2 ? -1 : 1)}deg)`});
	}

	this.shuffle = function() {
		shuffle(contents);
		deckNameNode.animate(frames, { duration: 500, iterations: 1 });
	};

	this.save = function() {
		return contents.map(card => card.name);
	};

}
