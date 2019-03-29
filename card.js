function newCard(initData) {
	
	const node = cloneCard(initData);
	let data = initData;
	
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
			x = gridFunc(bound(setX, 0, screenWidth  - CARD_WIDTH));
			y = gridFunc(bound(setY, 0, screenHeight - CARD_HEIGHT));
			display();
		},
		
		hide: function() {
			node.remove();
			revealed.delete(this);
			return data;
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
				card.bump();
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
		
		replace: function(newData) {
			let oldData = data;
			data = newData;
			node.classList.remove(...CARD_TYPES.map(t => t.toLowerCase()));
			initializeCard(node, data);
			return oldData;
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

	function between(value, min, max) {
		return value >= min && value < max;
	}
	
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
	document.body.appendChild(node);
	revealed.add(card);
	return card;
}

function cloneCard(data) {
	let node = document.getElementById('card').content.firstElementChild.cloneNode(true);
	initializeCard(node, data);
	return node;
}

function initializeCard(node, data) {
	node.classList.add(...data.types.map(t => t.toLowerCase()));
	node.getElementsByClassName('title')[0].innerText = data.name;
	let imageFile = data.name.toLowerCase().replace(/[ \-\/]+/g, '_').replace(/[^a-z_]+/g, '');
	node.getElementsByTagName('img')[0].src = 'art/' + imageFile + '.png';
	node.getElementsByClassName('cost')[0].innerText = data.cost;
}
