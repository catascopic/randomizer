'use strict';

// deck vars
var deck;
var revealed = new Set();

var grabbed = null;
var offsetX;
var offsetY;

var screenWidth;
var screenHeight;

var zIndex = 0;

const CARD_WIDTH = 120;
const CARD_HEIGHT = CARD_WIDTH;
const GRID_SIZE = 20;

var gridMode = false;
var boundFunc = bound;

// selector vars
var sets;
var promos;
var ownedCards;
var setMap = {};
var promoMap = {};

var ownedSets = new Set();
var ownedPromos = new Set();

function grab(e, card) {
	grabbed = card;
	offsetX = e.clientX - grabbed.x;
	offsetY = e.clientY - grabbed.y;
	measureScreen();
}

function measureScreen() {
	screenWidth = document.body.scrollWidth;
	screenHeight = document.body.scrollHeight;
	if (gridMode) {
		screenWidth = Math.floor(screenWidth / GRID_SIZE) * GRID_SIZE;
		screenHeight = Math.floor(screenHeight / GRID_SIZE) * GRID_SIZE;
	}
}

function release(e) {
	grabbed = null;
}

function move(e) {
	if (grabbed) {
		grabbed.setPosition(e.clientX - offsetX, e.clientY - offsetY);
	}
}

function bound(value, min, max) {
	return Math.min(Math.max(value, min), max);
}

function snap(value, min, max, gridSize) {
	return Math.round(bound(value, min, max) / gridSize) * gridSize;
}

function shortcut(e) {
	switch (e.key) {
		case 'g':
			toggleGrid();
			break;
		case 'b':
			if (grabbed != null) deck.putOnBottom(grabbed);
			break;
		case 'z':
			if (grabbed != null) grabbed.sendToBack();
			break;
		case 'm':
		case 's':
			deck.shuffle();
			break;
	}
}

function toggleGrid() {
	gridMode ^= true;
	document.body.classList.toggle('grid', gridMode);
	if (gridMode) {
		boundFunc = snap;
		for (let card of revealed) {
			card.snap();
		}
	} else {
		boundFunc = bound;
	}
}

function drawCard(e) {
	deck.draw(e);
}

function start() {
	if (!ownedSets.size) {
		return;
	}
	ownedCards = [];
	for (let setName of ownedSets) {
		ownedCards.push(...setMap[setName].cards);
	}
	for (let promoName of ownedPromos) {
		ownedCards.push(promoMap[promoName]);
	}
	shuffle(ownedCards);
	saveSession();
	document.getElementById('modal').classList.add('modal-hide');
	deck = createDeck();
}

function init(json) {
	sets = json.sets;
	promos = json.promos;
	for (let set of sets) {
		setMap[set.name] = set;
	}
	for (let promo of promos) {
		promoMap[promo.name] = promo;
	}
}

window.onload = function() {
	loadSession();
	updateStartButton();
	createSelectors(1, ownedSets,   sets,   'set');
	createSelectors(2, ownedPromos, promos, 'promo');
}

function createDeck() {
	let node = document.getElementById('deck');
	let total = document.getElementById('total');
	let contents = ownedCards;
	function updateDeck() {
		total.innerText = contents.length;
	}
	updateDeck();

	return {
		draw: function(e) {
			if (contents.length) {
				let card = createCard(contents.pop());
				revealed.add(card);
				grab(e, card);
			}
			updateDeck();
		},
		putOnBottom: function(card) {
			card.hide();
			contents.unshift(card.data);
			updateDeck();
			grabbed = null;
		},
		shuffle: function() {
			shuffle(contents);
			node.animate([
				{ filter: 'none' },
				{ filter: 'blur(5px)' }, 
				{ filter: 'none' }
			], {
				duration: 600,
				iterations: 1
			});
		}
	};
}

function createCard(data) {
	const node = document.createElement('div');
	const card = {
		x: 0,
		y: 0,
		data: data,
		setPosition: function(x, y) {
			this.x = boundFunc(x, 0, screenWidth  - CARD_WIDTH,  GRID_SIZE);
			this.y = boundFunc(y, 0, screenHeight - CARD_HEIGHT, GRID_SIZE);
			node.style.transform = 'translate(' + this.x + 'px, ' + this.y + 'px)';
		},
		snap: function() {
			this.x = Math.round(this.x / GRID_SIZE) * GRID_SIZE;
			this.y = Math.round(this.y / GRID_SIZE) * GRID_SIZE;
			node.style.transform = 'translate(' + this.x + 'px, ' + this.y + 'px)';
		},
		hide: function() {
			node.remove();
			revealed.delete(this);
		},
		sendToBack: function() {
			for (let card of revealed) {
				card.moveUp();
			}
			zIndex++;
			node.style.zIndex = 0;
		},
		moveUp: function() {
			node.style.zIndex++;
		}
	};
	loadCard(node, data);
	node.classList.add('card');
	node.style.zIndex = zIndex++;
	// node.style.transform = 'translate(0px, 0px)';
	node.onmousedown = function(e) {
		node.style.zIndex = zIndex++;
		grab(e, card);
	};
	document.body.appendChild(node);
	return card;
}

function loadCard(div, data) {
	const title = document.createElement('div');
	title.innerText = data.name;
	title.classList.add('title');
	for (let type of data.types) {
		title.classList.add(type.toLowerCase());
	}
	div.appendChild(title);
	const image = document.createElement('img');
	image.src = 'art/' + getFile(data.name) + '.png';
	image.ondragstart = function(e) { e.preventDefault(); };
	div.appendChild(image);
	const cost = document.createElement('div');
	cost.innerText = data.cost;
	cost.classList.add('cost');
	div.appendChild(cost);
}

function getFile(name) {
	return name.toLowerCase().replace(/[ \-\/]+/g, '_').replace(/[^a-z_]+/g, '');
}

function updateStartButton() {
	document.getElementById('start-button').classList.toggle('disabled', !ownedSets.size);
}

function createSelectors(col, selectorSet, items, className) {
	let row = 1;
	for (let item of items) {
		let node = document.createElement('div');
		node.innerText = item.name;
		node.classList.add('selector', 'noselect', className);
		node.style.gridRow = row++;
		node.style.gridColumn = col;
		if (selectorSet.has(item.name)) {
			node.classList.add('selected');
		}
		node.onclick = function(e) {
			let selected = !selectorSet.delete(item.name);
			if (selected) {
				selectorSet.add(item.name);
			}
			node.classList.toggle('selected', selected);
			updateStartButton();
			e.stopPropagation();
		};
		document.getElementById('selectors').appendChild(node);
	}
}

function loadSession() {
	let sessionJson = localStorage.getItem('session');
	if (sessionJson != null) {
		let session = JSON.parse(sessionJson);
		ownedSets = new Set(session.ownedSets);
		ownedPromos = new Set(session.ownedPromos);
		
	}
}

function saveSession() {
	localStorage.setItem('session', JSON.stringify({
		ownedSets: Array.from(ownedSets),
		ownedPromos: Array.from(ownedPromos)
	}));
}

