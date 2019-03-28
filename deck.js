function newDeck(contents) {
	
	const node = document.getElementById('deck');
	const total = document.getElementById('total');
	
	function updateTotal() {
		total.innerText = contents.length;
	}
	updateTotal();
	
	return {
		draw: function(e) {
			deselectAll();
			if (contents.length) {
				grab(e, newCard(contents.pop()));
				updateTotal();
			}
		}, 
		
		putOnBottom: function(card) {
			contents.unshift(card.hide());
			updateTotal();
			grabbed = null;
		},

		replace: function(card) {
			if (contents.length) {
				contents.unshift(card.replace(contents.pop()));
			}
		},

		placeGroup: function(x, y, rows, count, sort) {
			let total = Math.min(count, contents.length);
			let popped = contents.splice(-total);
			
			if (sort) {
				popped.sort((a, b) => a.cost - b.cost);
			}
			
			for (let i = 0; i < total; i++) {
				newCard(popped[i]).setPosition(x + Math.floor(i / rows) * CARD_HEIGHT, y + (i % rows) * CARD_WIDTH);
			}
			updateTotal();
		},

		shuffle: function() {
			shuffle(contents);
			node.animate([
				{ filter: 'none' },
				{ filter: 'blur(5px)' }, 
				{ filter: 'none' }
			], {
				duration: 600,
				iterations: 1
			});
		},
		
		cheat: function(cardName) {
			let index = contents.findIndex(c => c.name == cardName);
			if (index == -1) {
				throw 'not found';
			}
			swap(contents, index, contents.length - 1);
			return 'swapped at position ' + index;
		}
	};
}
