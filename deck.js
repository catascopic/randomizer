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
			deselectAll();
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

	replace(card) {
		card.hide();
		this.contents.unshift(card.data);
		let newCard = createCard(this.contents.pop());
		newCard.replace(card);
		return newCard;
	}
	
	place() {
		let newCard = createCard(this.contents.pop());
		this.updateDeck();
		let x;
		let y;
		if (lastCard.x + (CARD_WIDTH * 2) <= screenWidth) {
			x = lastCard.x + CARD_WIDTH;
			y = lastCard.y;
		} else {
			x = 0;
			y = lastCard.y + CARD_HEIGHT;
		}
		
		
		newCard.setPosition(x, y);
		newCard.toTop();
		lastCard = newCard;
		return newCard;
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
