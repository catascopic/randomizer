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

function grab(e, card) {
	e.stopPropagation();
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
	grabbed.stop();
	grabbed = null;
}

function move(e) {
	if (grabbed) {
		grabbed.setPosition(e.clientX, e.clientY);
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
	if (grabbed) grabbed.stop();
	grabbed = createSelectorBox(e);
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
	
}
window.onmouseup = release;
window.onmousemove = move;
window.onmousedown = startSelectorBox;


function createSelectorBox(e) {
	const node = document.createElement('div');
	node.classList.add('selector-box');
	node.classList.remove('hide');
	node.style.zIndex = zIndex;
	const startX = e.clientX;
	const startY = e.clientY;
	document.body.appendChild(node);
	return {
		setPosition: function(x, y) {
			node.style.transform = 'translate('
					+ Math.min(x, startX) + 'px, '
					+ Math.min(y, startY) + 'px)';
			node.style.width = Math.abs(x - startX) + 'px';
			node.style.height = Math.abs(y - startY) + 'px';
		},
		stop: function() {
			node.remove();
		}
	};
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

