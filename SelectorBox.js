class SelectorBox extends Draggable {

	constructor(node) {
		super();
		this.node = node;
	}

	start(e) {
		this.node.classList.remove('hide');
		this.node.style.zIndex = zIndex;
		this.startX = e.clientX;
		this.startY = e.clientY;
		this.setPosition(this.startX, this.startY);
	}

	move(e) {
		this.setPosition(e.clientX, e.clientY);
	}
	
	setPosition(x, y) {
		this.x = x;
		this.y = y;
		this.node.style.transform = 'translate('
				+ Math.min(x, this.startX) + 'px, '
				+ Math.min(y, this.startY) + 'px)';
		this.node.style.width = Math.abs(x - this.startX) + 'px';
		this.node.style.height = Math.abs(y - this.startY) + 'px';
		let boxX = Math.min(this.x, this.startX);
		let boxY = Math.min(this.y, this.startY);
		let boxWidth = Math.abs(this.x - this.startX);
		let boxHeight = Math.abs(this.y - this.startY);
		for (let card of revealed) {
			card.highlight(overlap(card.x, card.y, boxX, boxY, boxWidth, boxHeight));
		}
	}

	stop() {
		this.node.classList.add('hide');
		let boxX = Math.min(this.x, this.startX);
		let boxY = Math.min(this.y, this.startY);
		let boxWidth = Math.abs(this.x - this.startX);
		let boxHeight = Math.abs(this.y - this.startY);
		for (let card of revealed) {
			if (overlap(card.x, card.y, boxX, boxY, boxWidth, boxHeight)) {
				selected.add(card);
			}
		}
	}

}

function overlap(cardX, cardY, boxX, boxY, boxWidth, boxHeight) {
	return (between(cardX, boxX, boxX + boxWidth)  || between(boxX, cardX, cardX + CARD_WIDTH))
		&& (between(cardY, boxY, boxY + boxHeight) || between(boxY, cardY, cardY + CARD_HEIGHT));
}

function between(value, min, max) {
	return value >= min && value < max;
}
