function newCard(data) {
	
	const node = document.getElementById('card').content.firstElementChild.cloneNode(true);
	
	let x = 0;
	let y = 0;
	let offsetX;
	let offsetY;
	let zIndex = topZIndex++;
	let highlighted = false;
	
	let card = {

		start: function(e) {
			offsetX = e.clientX - x;
			offsetY = e.clientY - y;
			this.toTop();
		},

		move: function(e) {
			this.setPosition(e.clientX - offsetX, e.clientY - offsetY);
		},
		
		stop: function () {},
		
		setPosition(setX, setY) {
			x = bound(setX, 0, screenWidth  - CARD_WIDTH);
			y = bound(setY, 0, screenHeight - CARD_HEIGHT);
			display();
		},
		
		hide: function() {
			node.remove();
			revealed.delete(this);
		},
		
		snap: function() {
			x = snapToGrid(x);
			y = snapToGrid(y);
			display();
		},
	
		toTop: function() {
			zIndex = topZIndex++;
			node.style.zIndex = zIndex;
		},

		sendToBack: function() {
			for (let card of revealed) {
				card.moveUp();
			}
			topZIndex++;
			node.style.zIndex = 0;
		},

		bump: function() {
			zIndex++;
			node.style.zIndex = zIndex;
		},

		highlight: function(setHighlighted) {
			highlighted = setHighlighted;
			node.classList.toggle('card-selected', highlighted == undefined || highlighted);
		},

		replaceWith: function(card) {
			card.replace({x: x, y: y, offsetX: offsetX, offsetY: offsetY, zIndex: zIndex, highlighted: highlighted});
			if (selected.delete(this)) {
				selected.add(card);
			}
		},
		
		replace: function(copy) {
			x = copy.x;
			y = copy.y;
			offsetX = copy.offsetX;
			offsetY = copy.offsetY;
			zIndex = copy.zIndex;
			node.style.zIndex = zIndex;
			this.highlight(copy.highlighted);
			display();
		},
		
		overlaps(boxX, boxY, boxWidth, boxHeight) {
			return (between(x, boxX, boxX + boxWidth)  || between(boxX, x, x + CARD_WIDTH))
				&& (between(y, boxY, boxY + boxHeight) || between(boxY, y, y + CARD_HEIGHT));
		}
	};
	
	// "private" functions
	
	function display() {
		node.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
	}

	function getImageFile(name) {
		return name.toLowerCase().replace(/[ \-\/]+/g, '_').replace(/[^a-z_]+/g, '');
	}

	function bound(value, min, max) {
		return gridFunc(Math.min(Math.max(value, min), max));
	}

	function between(value, min, max) {
		return value >= min && value < max;
	}
	
	// setup HTML
	
	node.style.zIndex = topZIndex++;
	node.onmousedown = function(e) {
		if (e.shiftKey) {
			console.log(data.name);
			console.log(data.text);
			console.log(data.types.join('-'));
			console.log();
		}
		if (selected.has(card)) {
			grab(e, SELECTION);
		} else {
			deselectAll();
			grab(e, card);
		}
	};
	for (let type of data.types) {
		node.classList.add(type.toLowerCase());
	}
	
	// TODO: allow reinitialization with new data
	
	node.getElementsByClassName('title')[0].innerText = data.name;
	node.getElementsByTagName('img')[0].src = 'art/' + getImageFile(data.name) + '.png';
	node.getElementsByClassName('cost')[0].innerText = data.cost;
	document.body.appendChild(node);
	
	revealed.add(card);
	
	return card;
}

