class Card extends Draggable {

	constructor(data, node) {
		super();
		this.x = 0;
		this.y = 0;
		this.data = data;
		this.node = node;
	}

	start(e) {
		this.offsetX = e.clientX - this.x;
		this.offsetY = e.clientY - this.y;
		this.toTop();
	}

	move(e) {
		this.setPosition(e.clientX - this.offsetX, e.clientY - this.offsetY);
	}

	setPosition(x, y) {
		this.x = boundFunc(x, 0, screenWidth  - CARD_WIDTH);
		this.y = boundFunc(y, 0, screenHeight - CARD_HEIGHT);
		this.node.style.transform = 'translate(' + this.x + 'px, ' + this.y + 'px)';
	}

	snap() {
		this.x = Math.round(this.x / GRID_SIZE) * GRID_SIZE;
		this.y = Math.round(this.y / GRID_SIZE) * GRID_SIZE;
		this.node.style.transform = 'translate(' + this.x + 'px, ' + this.y + 'px)';
	}

	hide() {
		this.node.remove();
		revealed.delete(this);
	}
	
	toTop() {
		this.node.style.zIndex = zIndex++;
	}

	sendToBack() {
		for (let card of revealed) {
			card.moveUp();
		}
		zIndex++;
		this.node.style.zIndex = 0;
	}

	moveUp() {
		this.node.style.zIndex++;
	}

	highlight(isHighlighted) {
		this.node.classList.toggle('card-selected', isHighlighted == undefined || isHighlighted);
	}

	replace(card) {
		this.x = card.x;
		this.y = card.y;
		this.offsetX = card.offsetX;
		this.offsetY = card.offsetY;
		this.node.style.zIndex = card.node.style.zIndex;
		this.highlight(card.node.classList.contains('card-selected'));
		if (selected.delete(card)) {
			selected.add(this);
		}
		this.node.style.transform = card.node.style.transform;
	}

}

function createCard(data) {
	let node = document.getElementById('card').content.firstElementChild.cloneNode(true);
	let card = new Card(data, node);
	node.style.zIndex = zIndex++;
	node.onmousedown = function(e) {
		if (selected.has(card)) {
			grab(e, SELECTION);
		} else {
			// TODO: make this better
			if (!e.ctrlKey) {
				deselectAll();
			}
			grab(e, card);
		}
	};
	for (let type of data.types) {
		node.classList.add(type.toLowerCase());
	}

	node.getElementsByClassName('title')[0].innerText = data.name;
	node.getElementsByTagName('img')[0].src = 'art/' + getImageFile(data.name) + '.png';
	node.getElementsByClassName('cost')[0].innerText = data.cost;

	document.body.appendChild(node);
	revealed.add(card);
	return card;
}

function getImageFile(name) {
	return name.toLowerCase().replace(/[ \-\/]+/g, '_').replace(/[^a-z_]+/g, '');
}
