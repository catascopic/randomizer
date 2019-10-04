function Tile(initCard) {
	
	let card = initCard;
	
	// It's 2019 and we're still doing this!?
	const tileNode = document.createElement('div');
	tileNode.className = 'card';
	const nameNode = document.createElement('div');
	nameNode.className = 'name';
	const artNode = document.createElement('img');
	artNode.ondragstart = noDrag;
	const costNode = document.createElement('div');
	costNode.className = 'cost';
	tileNode.append(nameNode);
	tileNode.append(artNode);
	tileNode.append(costNode);
	
	function initialize () {
		tileNode.classList.add(...card.types);
		nameNode.innerText = card.name;
		costNode.innerText = card.cost;
		let imageFile = card.name.toLowerCase().replace(/[ \-\/]+/g, '_').replace(/[^a-z_]+/g, '');
		artNode.src = `art/${imageFile}.png`;
	}
	
	initialize();
	
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
		x = gridFunc(bound(setX, 0, screenWidth  - TILE_WIDTH));
		y = gridFunc(bound(setY, 0, screenHeight - TILE_HEIGHT));
		display();
	};
	
	this.snap = function() {
		x = snapToGrid(x);
		y = snapToGrid(y);
		display();
	};

	this.toTop = function() {
		zIndex = topZIndex++;
		tileNode.style.zIndex = zIndex;
	};

	this.sendToBack = function() {
		for (let card of revealed) {
			card.bump();
		}
		topZIndex++;
		tileNode.style.zIndex = 0;
	};

	this.bump = function() {
		zIndex++;
		tileNode.style.zIndex = zIndex;
	};
	
	this.replace = function() {
		tileNode.classList.remove(...card.types);
		card = deck.replace(card);
		initialize();
	};
	
	this.remove = function() {
		this.removeUnsafe();
		grabbed = DEFAULT_GRAB;
	};
	
	// "unsafe" because if you call this with any remaining references to this object, could cause unwanted behavior.
	this.removeUnsafe = function() {
		if (!revealed.delete(this)) {
			throw 'failed remove';
		}
		deck.putOnBottom(card);
		tileNode.remove();
	};

	this.checkOverlap = function(boxX, boxY, boxWidth, boxHeight) {
		this.select((between(x, boxX, boxX + boxWidth)  || between(boxX, x, x + TILE_WIDTH))
				&&  (between(y, boxY, boxY + boxHeight) || between(boxY, y, y + TILE_HEIGHT)));
	};

	this.select = function(isSelected) {
		tileNode.classList.toggle('card-selected', isSelected);
		toggle(selected, this, isSelected);
	};
	
	this.deselectUnsafe = function(isSelected) {
		tileNode.classList.remove('card-selected');
	};
	
	this.shift = function(deltaX, deltaY) {
		this.setPosition(x + deltaX, y + deltaY);
	}

	// "private" functions
	
	function display() {
		tileNode.style.transform = `translate(${x}px, ${y}px)`;
	}

	function between(value, min, max) {
		return value >= min && value < max;
	}
	
	tileNode.style.zIndex = topZIndex++;
	let _this = this;
	tileNode.onmousedown = function(event) {
		event.stopPropagation();
		if (event.shiftKey) {
			console.log(card.name);
			console.log(card.text);
			console.log(`${card.types.join('-')} (${card.cost})`);
			console.log();
		} else if (event.ctrlKey) {
			_this.select(!selected.has(_this));
			updateAnySelected();
		} else if (selected.has(_this)) {
			grab(event, SELECTION);
		} else {
			deselectAll();
			grab(event, _this);
		}
	};
	
	document.body.appendChild(tileNode);
	revealed.add(this);
}

Tile.prototype = new Grabbable();
