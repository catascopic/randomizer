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
	
	let posX = initX;
	let posY = initY;
	let zIndex = initZ;
	let offsetX;
	let offsetY;
	
	this.start = function(x, y) {
		offsetX = x - posX;
		offsetY = y - posY;
		setZIndex(topZIndex++);
	};

	this.move = function(x, y) {
		this.setPosition(x - offsetX, y - offsetY);
	};
	
	this.setPosition = function(x, y) {
		posX = gridFunc(bound(x, 0, screenWidth  - TILE_WIDTH));
		posY = gridFunc(bound(y, 0, screenHeight - TILE_HEIGHT));
		display();
	};
	
	this.snap = function() {
		posX = snapToGrid(posX);
		posY = snapToGrid(posY);
		display();
	};

	this.sendToBack = function() {
		for (let card of revealed) {
			card.bump();
		}
		topZIndex++;
		setZIndex(0);
	};

	this.bump = function() {
		setZIndex(zIndex + 1);
	};
	
	function setZIndex(z) {
		zIndex = z;
		tileNode.style.zIndex = zIndex;
	}
	
	this.replace = function() {
		tileNode.classList.remove(...card.types);
		card = deck.replace(card);
		initialize();
	};
	
	this.remove = function() {
		this.removeUnsafe();
		grabbed = DEFAULT_GRAB;
	};
	
	// unsafe: "grabbed" container could still hold a reference to this, callers must ensure this is OK
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
		this.select((between(posX, boxX, boxX + boxWidth)  || between(boxX, posX, posX + TILE_WIDTH))
				&&  (between(posY, boxY, boxY + boxHeight) || between(boxY, posY, posY + TILE_HEIGHT)));
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
		this.setPosition(posX + deltaX, posY + deltaY);
	};
	
	this.getName = function() {
		return card.name;
	}
	
	this.save = function() {
		return {
			name: card.name,
			x: posX,
			y: posY,
			z: zIndex
		};
	};

	// I don't like getters
	this.getZ = function() {
		return zIndex;
	}
	
	this.updateArea = function(area) {
		area.minX = Math.min(area.minX, posX);
		area.minY = Math.min(area.minY, posY);
		area.maxX = Math.max(area.maxX, posX + TILE_WIDTH);
		area.maxY = Math.max(area.maxY, posY + TILE_HEIGHT);
	}
	
	function display() {
		tileNode.style.transform = `translate(${posX}px, ${posY}px)`;
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
