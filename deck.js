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
		if (this.contents.length) {
			let card = createCard(this.contents.pop());
			revealed.add(card);
			grab(e, card);
		}
		this.updateDeck();
	}
		
	putOnBottom(card) {
		card.hide();
		this.contents.unshift(card.data);
		this.updateDeck();
		grabbed = null;
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
