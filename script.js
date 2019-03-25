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

var selectorBox;

// selector vars
var sets;
var promos;
var ownedCards;

// redo this
var setMap = {};
var promoMap = {};

var ownedSets = new Set();
var ownedPromos = new Set();

var selected = new Set();

function grab(e, grabbedCard) {
	e.stopPropagation();
	if (selected.has(grabbedCard)) {
		for (let card of selected) {
			card.start(e);
		}
	} else {
		clearSelected();
		grabbedCard.start(e);
	}
	grabbed = grabbedCard;
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
	grabbed.stop();
	grabbed = null;
}

function move(e) {
	if (grabbed) {
		if (selected.size) {
			for (let card of selected) {
				card.setPosition(e.clientX, e.clientY);
			}
		} else {
			grabbed.setPosition(e.clientX, e.clientY);
		}
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
	if (grabbed) grabbed.stop();
	deck.draw(e);
}

function startSelectorBox(e) {
	clearSelected();
	selectorBox.start(e);
	grabbed = selectorBox;
}

function clearSelected() {
	for (let card of selected) {
		card.select(false);
	}
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
	document.getElementById('modal').classList.add('hide');
	deck = new Deck(ownedCards);
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
	selectorBox = createSelectorBox();
}
window.onmouseup = release;
window.onmousemove = move;
window.onmousedown = startSelectorBox;

function createSelectorBox() {
	const node = document.getElementById('selector-box');
	return {
		start: function(e) {
			node.classList.remove('hide');
			node.style.zIndex = zIndex;
			this.startX = e.clientX;
			this.startY = e.clientY;
			this.setPosition(this.startX, this.startY);
		},
		setPosition: function(x, y) {
			this.x = x;
			this.y = y;
			node.style.transform = 'translate('
					+ Math.min(x, this.startX) + 'px, '
					+ Math.min(y, this.startY) + 'px)';
			node.style.width = Math.abs(x - this.startX) + 'px';
			node.style.height = Math.abs(y - this.startY) + 'px';
		},
		stop: function() {
			let boxX = Math.min(this.x, this.startX);
			let boxY = Math.min(this.y, this.startY);
			let boxWidth = Math.abs(this.x - this.startX);
			let boxHeight = Math.abs(this.y - this.startY);
			for (let card of revealed) {
				if (overlap(card.x, card.y, boxX, boxY, boxWidth, boxHeight)) {
					card.select(true);
				}
			}
			node.classList.add('hide');
		}
	};
}

function overlap(cardX, cardY, boxX, boxY, boxWidth, boxHeight) {
	return (inRange(cardX, boxX, boxX + boxWidth)  || inRange(boxX, cardX, cardX + CARD_WIDTH))
		&& (inRange(cardY, boxY, boxY + boxHeight) || inRange(boxY, cardY, cardY + CARD_HEIGHT));
}

function inRange(value, min, max) {
	return value >= min && value <= max; 
}

// SELECTORS

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

