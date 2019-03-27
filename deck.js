class Deck {
	
	constructor(contents) {
		this.node = document.getElementById('deck');
		this.total = document.getElementById('total');
		this.contents = contents;
		this.updateDeck();
	}
	
	updateDeck() {
		this.total.innerText = this.contents.length;
	}

	draw(e) {
		deselectAll();
		if (this.contents.length) {
			let card = newCard(this.contents.pop());
			grab(e, card);
			this.updateDeck();
		}
	}

	putOnBottom(card) {
		card.hide();
		this.contents.unshift(card.data);
		this.updateDeck();
		grabbed = null;
	}

	replace(card) {
		card.hide();
		this.contents.unshift(card.data);
		let replacement = newCard(this.contents.pop());
		card.replaceWith(replacement);
		return replacement;
	}
	
	place(x, y) {
		if (this.contents.length) {
			let card = newCard(this.contents.pop());
			this.updateDeck();
			card.setPosition(x, y);
			return card;
		}
		return null;
	}

	shuffle() {
		shuffle(this.contents);
		this.node.animate([
			{ filter: 'none' },
			{ filter: 'blur(5px)' }, 
			{ filter: 'none' }
		], {
			duration: 600,
			iterations: 1
		});
	}
}
