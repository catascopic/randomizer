function Card(initData) {
	
	const node = cloneCard(initData);
	let data = initData;
	
	let x = 0;
	let y = 0;
	let offsetX;
	let offsetY;
	let zIndex = topZIndex++;
	
	this.start = function(e) {
		offsetX = e.clientX - x;
		offsetY = e.clientY - y;
		this.toTop();
	};

	this.move = function(e) {
		this.setPosition(e.clientX - offsetX, e.clientY - offsetY);
	};
	
	this.setPosition = function(setX, setY) {
		x = gridFunc(bound(setX, 0, screenWidth  - CARD_WIDTH));
		y = gridFunc(bound(setY, 0, screenHeight - CARD_HEIGHT));
		display();
	};
	
	this.snap = function() {
		x = snapToGrid(x);
		y = snapToGrid(y);
		display();
	};

	this.toTop = function() {
		zIndex = topZIndex++;
		node.style.zIndex = zIndex;
	};

	this.sendToBack = function() {
		for (let card of revealed) {
			card.bump();
		}
		topZIndex++;
		node.style.zIndex = 0;
	};

	this.bump = function() {
		zIndex++;
		node.style.zIndex = zIndex;
	};
	
	this.replace = function() {
		data = deck.replace(data);
		node.classList.remove(...CARD_TYPES.map(t => t.toLowerCase()));
		initializeCard(node, data);
	};
	
	this.remove = function() {
		this.removeUnsafe();
		grabbed = null;
	};
	
	this.removeUnsafe = function() {
		deck.putOnBottom(data);
		node.remove();
		revealed.delete(this);
	};

	this.checkOverlap = function(boxX, boxY, boxWidth, boxHeight) {
		this.select((between(x, boxX, boxX + boxWidth)  || between(boxX, x, x + CARD_WIDTH))
				&&  (between(y, boxY, boxY + boxHeight) || between(boxY, y, y + CARD_HEIGHT)));
	};

	this.select = function(isSelected) {
		node.classList.toggle('card-selected', isSelected);
		toggle(selected, this, isSelected);
	};
	
	this.deselectUnsafe = function(isSelected) {
		node.classList.remove('card-selected');
	};

	// "private" functions
	
	function display() {
		node.style.transform = `translate(${x}px, ${y}px)`;
	}

	function between(value, min, max) {
		return value >= min && value < max;
	}
	
	node.style.zIndex = topZIndex++;
	let _this = this;
	node.onmousedown = function(event) {
		if (event.shiftKey) {
			console.log(data.name);
			console.log(data.text);
			console.log(data.types.join('-'));
			console.log();
		}
		if (selected.has(_this)) {
			grab(event, SELECTION);
		} else {
			deselectAll();
			grab(event, _this);
		}
	};	
	document.body.appendChild(node);
	revealed.add(this);
}

Card.prototype = new Grabbable();

function cloneCard(data) {
	let node = document.getElementById('card').content.firstElementChild.cloneNode(true);
	initializeCard(node, data);
	return node;
}

function initializeCard(node, data) {
	node.classList.add(...data.types.map(t => t.toLowerCase()));
	node.getElementsByClassName('title')[0].innerText = data.name;
	let imageFile = data.name.toLowerCase().replace(/[ \-\/]+/g, '_').replace(/[^a-z_]+/g, '');
	node.getElementsByTagName('img')[0].src = `art/${imageFile}.png`;
	node.getElementsByClassName('cost')[0].innerText = data.cost;
}
