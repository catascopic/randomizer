'use strict';

// deck vars
var deck;
var revealed = [];

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
var lookup = {};

var ownedSets = new Set();
var ownedPromos = new Set();

function grab(e, card) {
	grabbed = card;
	offsetX = e.clientX - grabbed.x;
	offsetY = e.clientY - grabbed.y;
	screenWidth = document.body.scrollWidth;
	screenHeight = document.body.scrollHeight;
}

function release(e) {
	grabbed = null;
}

function move(e) {
	if (grabbed) {
		grabbed.setPosition(
				boundFunc(e.clientX - offsetX, 0, screenWidth  - CARD_WIDTH,  GRID_SIZE),
				boundFunc(e.clientY - offsetY, 0, screenHeight - CARD_HEIGHT, GRID_SIZE));
	}
}

function bound(value, min, max) {
	return Math.min(Math.max(value, min), max);
}

function snap(value, min, max, gridSize) {
	return Math.round(Math.min(Math.max(value, min), max) / gridSize) * gridSize;
}

function snapAll() {
	for (let card of revealed) {
		card.setPosition(Math.round(card.x / 20) * 20, Math.round(card.y / 20) * 20);
	}
}

function shortcut(e) {
	switch (e.key) {
		case 'g':
			gridMode ^= true;
			boundFunc = gridMode ? snap : bound;
			document.body.classList.toggle('grid', gridMode);
			if (gridMode) snapAll();
			break;
		case 'b':
			if (grabbed != null) deck.putOnBottom(grabbed);
			break;
		case 'm':
		case 's':
			deck.shuffle();
			break;
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
		ownedCards.push(...lookup[setName].cards);
	}
	ownedCards.push(...ownedPromos);
	shuffle(ownedCards);
	saveSession();
	document.getElementById('modal').classList.add('modal-hide');
	deck = createDeck();
}

function init(json) {
	sets = json.sets;
	promos = json.promos;
	for (let set of sets) {
		lookup[set.name] = set;
	}
}

window.onload = function() {
	loadSession();
	updateStartButton();
	createSelectors(1,
			ownedSets,
			sets,
			'set',
			set => set.name);
	createSelectors(2,
			ownedPromos,
			promos,
			'promo',
			promo => promo);
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
				revealed.push(card);
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
			this.x = x;
			this.y = y;
			node.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
		},
		hide: function() {
			node.remove();
		}
	};
	
	node.classList.add('card', 'action');
	node.style.zIndex = zIndex++;
	node.innerText = data;
	node.onmousedown = function(e) {
		node.style['z-index'] = zIndex++;
		grab(e, card);
	};
	
	document.body.appendChild(node);
	return card;
}

function updateStartButton() {
	document.getElementById('start-button').classList.toggle('disabled', !ownedSets.size);
}

function createSelectors(col, selectorSet, items, className, mapper) {
	let row = 1;
	for (let item of items) {
		let name = mapper(item);
		let node = document.createElement('div');
		node.innerText = name;
		node.classList.add('selector', 'noselect', className);
		node.style.gridRow = row++;
		node.style.gridColumn = col;
		if (selectorSet.has(name)) {
			node.classList.add('selected');
		}
		node.onclick = function(e) {
			let selected = !selectorSet.delete(name);
			if (selected) {
				selectorSet.add(name);
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

