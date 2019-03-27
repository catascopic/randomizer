class SelectorBox extends Draggable {

	constructor(node) {
		super();
		this.node = node;
	}

	start(e) {
		this.node.classList.remove('hide');
		this.node.style.zIndex = topZIndex;
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
			card.highlight(selected.has(card) || card.overlaps(boxX, boxY, boxWidth, boxHeight));
		}
	}

	stop() {
		this.node.classList.add('hide');
		let boxX = Math.min(this.x, this.startX);
		let boxY = Math.min(this.y, this.startY);
		let boxWidth = Math.abs(this.x - this.startX);
		let boxHeight = Math.abs(this.y - this.startY);
		for (let card of revealed) {
			if (card.overlaps(boxX, boxY, boxWidth, boxHeight)) {
				selected.add(card);
			}
		}
	}

}
