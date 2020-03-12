function loadTile(savedTile) {
	return new Tile(cardLookup[savedTile.name], savedTile.x, savedTile.y, savedTile.z);
}

function drawTile(card) {
	return new Tile(card, 0, 0, 0);
}

function generateTile(card, x, y) {
	return new Tile(card, x, y, topZIndex++);
}

function Tile(initCard, initX, initY, initZ) {
	
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
		artNode.src = `art/${getImageFileName(card.name)}.png`;
	}

	initialize();
	
	let x = initX;
	let y = initY;
	let z = initZ;
	let offsetX;
	let offsetY;
	
	this.start = function(e) {
		offsetX = e.clientX - x;
		offsetY = e.clientY - y;
		z = topZIndex++;
		tileNode.style.zIndex = z;
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

	this.sendToBack = function() {
		for (let card of revealed) {
			card.bump();
		}
		topZIndex++;
		tileNode.style.zIndex = 0;
	};

	this.bump = function() {
		z++;
		tileNode.style.zIndex = z;
	};
	
	this.replace = function(reverse) {
		tileNode.classList.remove(...card.types);
		card = reverse ? deck.replaceBottom(card) : deck.replace(card);
		initialize();
	};
	
	this.remove = function() {
		this.removeUnsafe();
		grabbed = DEFAULT_GRAB;
	};
	
	// unsafe: could still exist as grabbed, callers must ensure this is OK
	this.removeUnsafe = function() {
		if (!revealed.delete(this)) {
			throw 'failed remove';
		}
		deck.putOnBottom(card);
		tileNode.remove();
	};
	
	this.clear = function() {
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
	
	// unsafe: only changes the appearance, callers must actually remove it from the selected set
	this.deselectUnsafe = function(isSelected) {
		tileNode.classList.remove('card-selected');
	};
	
	this.shift = function(deltaX, deltaY) {
		this.setPosition(x + deltaX, y + deltaY);
	};
	
	this.getName = function() {
		return card.name;
	}
	
	this.save = function() {
		return {
			name: card.name,
			x: x,
			y: y,
			z: z
		};
	};

	// I don't like getters
	this.getZ = function() {
		return z;
	}
	
	function display() {
		tileNode.style.transform = `translate(${x}px, ${y}px)`;
	}
	
	let _this = this;
	tileNode.onmousedown = function(event) {
		event.stopPropagation();
		if (event.shiftKey) {
			console.log(`${card.name}\n${card.text}\n${card.types.join('-')} (${card.cost})`);
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
	
	display();
	document.body.appendChild(tileNode);
	revealed.add(this);
}

Tile.prototype = new Grabbable();

function getImageFileName(cardName) {
	return cardName.toLowerCase().replace(/[ \-\/]+/g, '_').replace(/[^a-z_]+/g, '');
}
