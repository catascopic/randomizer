class GeneratorBox extends Draggable {

	constructor(node) {
		super();
		this.node = node;
	}

	start(e) {
		this.node.classList.remove('hide');
		this.node.style.zIndex = zIndex;
		this.startX = e.clientX;
		this.startY = e.clientY;
		this.setPosition(this.startX + CARD_WIDTH, this.startY + CARD_HEIGHT);
	}

	move(e) {
		this.setPosition(e.clientX, e.clientY);
	}
	
	setPosition(x, y) {
		this.x = x;
		this.y = y;
		
		this.countAcross = getCount(this.x, this.startX, CARD_WIDTH);
		this.countDown = getCount(this.y, this.startY, CARD_HEIGHT);
		
		this.node.style.width = this.countAcross * CARD_WIDTH + 'px';
		this.node.style.height = this.countDown * CARD_HEIGHT + 'px';
		
		this.node.style.transform = 'translate('
				+ Math.min(this.x, this.startX) + 'px, '
				+ Math.min(this.y, this.startY) + 'px)';
		let count = this.countAcross * this.countDown;
		this.node.innerText = count;
	}

	stop() {
		this.node.classList.add('hide');
		let x = Math.min(this.x, this.startX);
		let y = Math.min(this.y, this.startY);
		let total = this.countAcross * this.countDown;
		for (let i = 0; i < total; i++) {
			deck.place(x + Math.floor(i / this.countDown) * CARD_HEIGHT, y + (i % this.countDown) * CARD_WIDTH);
		}
	}

}

function getCount(pos, start, dim) {
	return Math.max(Math.ceil(Math.abs(pos - start) / dim), 1);
}
