class Card extends Draggable {
	
	constructor(data, node) {
		super();
		this.x = 0;
		this.y = 0;
		this.data = data;
		this.node = node;
	}
	
	setPosition(x, y) {
		this.x = boundFunc(x - offsetX, 0, screenWidth  - CARD_WIDTH,  GRID_SIZE);
		this.y = boundFunc(y - offsetY, 0, screenHeight - CARD_HEIGHT, GRID_SIZE);
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

}

function createCard(data) {
	let node = document.createElement('div');
	let card = new Card(data, node);
	node.classList.add('card');
	node.style.zIndex = zIndex++;
	node.onmousedown = function(e) {
		node.style.zIndex = zIndex++;
		grab(e, card);
	};
	node.appendChild(createTitle(data));
	node.appendChild(createPicture(data));
	node.appendChild(createCost(data));
	document.body.appendChild(node);
	return card;
}

function createTitle(data) {
	let node = document.createElement('div');
	node.innerText = data.name;
	node.classList.add('title');
	for (let type of data.types) {
		node.classList.add(type.toLowerCase());
	}
	return node;
}

function createPicture(data) {
	let node = document.createElement('img');
	let file = data.name.toLowerCase().replace(/[ \-\/]+/g, '_').replace(/[^a-z_]+/g, '');
	node.src = 'art/' + file + '.png';
	node.ondragstart = function(e) { e.preventDefault(); };
	return node;
}

function createCost(data) {
	let node = document.createElement('div');
	node.innerText = data.cost;
	node.classList.add('cost');
	return node;
}
