class Card extends Draggable {
	
	constructor(data, node) {
		super();
		this.x = 0;
		this.y = 0;
		this.data = data;
		this.node = node;
		this.overlay = node.getElementsByClassName('overlay')[0];
	}
	
	start(e) {
		this.offsetX = e.clientX - this.x;
		this.offsetY = e.clientY - this.y;
	}
	
	setPosition(x, y) {
		this.x = boundFunc(x - this.offsetX, 0, screenWidth  - CARD_WIDTH,  GRID_SIZE);
		this.y = boundFunc(y - this.offsetY, 0, screenHeight - CARD_HEIGHT, GRID_SIZE);
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

	select(isSelected) {
		this.overlay.classList.toggle('card-selected', isSelected);
		if (isSelected) {
			selected.add(this);
		} else {
			selected.delete(this);
		}
	}
}

function createCard(data) {
	let node = document.getElementById('card').cloneNode(true).content.firstElementChild;
	let card = new Card(data, node);
	node.style.zIndex = zIndex++;
	node.onmousedown = function(e) {
		node.style.zIndex = zIndex++;
		grab(e, card);
	};

	let title = node.getElementsByClassName('title')[0];
	title.innerText = data.name;
	for (let type of data.types) {
		title.classList.add(type.toLowerCase());
	}
	node.getElementsByTagName('img')[0].src = 'art/' + getImageFile(data.name) + '.png';
	node.getElementsByClassName('cost')[0].innerText = data.cost;
	
	document.body.appendChild(node);
	return card;
}

function getImageFile(name) {
	return name.toLowerCase().replace(/[ \-\/]+/g, '_').replace(/[^a-z_]+/g, '');
}
