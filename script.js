'use strict';

var grabbed = null;
var revealed = new Set();
var selected = new Set();
var deck;
var SELECTOR_BOX;
var GENERATOR_BOX;
var SEARCH_DIALOG;
const SELECTION = newSelection();

var screenWidth;
var screenHeight;
var topZIndex = 0;

const CARD_WIDTH = 120;
const CARD_HEIGHT = CARD_WIDTH;
const GRID_SIZE = 20;

var gridMode = false;
var gridFunc = noGrid;

// selector vars
var sets;
var promos;
var ownedCards;

var ownedSets = new Set();
var ownedPromos = new Set();

function noGrid(n) {
	return n;
}

function snapToGrid(n) {
	return nearestMultiple(n, GRID_SIZE);
}

function bound(value, min, max) {
	return Math.min(Math.max(value, min), max);
}

function grab(e, target) {
	e.stopPropagation();
	target.start(e);
	grabbed = target;
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
	if (grabbed != null) {
		grabbed.stop(e);
		grabbed = null;
	}
}

function move(e) {
	if (grabbed) {
		grabbed.move(e);
	}
}

function shortcut(e) {
	switch (e.key) {
		case 'g':
			toggleGrid();
			break;
		case 'Backspace':
			putOnBottom();
			break;
		case 'r':
			replace();
			break;
		case 'z':
			if (grabbed != null) grabbed.sendToBack();
			break;
		case 'a':
			selectAll();
			break;
		case 's':
			SEARCH_DIALOG.open();
			break;
		case 'n':
			let data = deck.contents.pop();
			let name = document.getElementById('text-box-name');
			name.innerText = data.name;
			name.className = 'text-box-name';
			name.classList.add(...data.types.map(x => x.toLowerCase()));
			document.getElementById('text-box-text').innerHTML = data.text
					.replace('\n---\n', '<hr>')
					.replace(/\{\$(\d*)\}/g, '<span class="coins">$1</span>');
			let types = document.getElementById('text-box-types');
			types.innerText = data.types.join('-');;
			types.className = 'text-box-types';
			types.classList.add(...data.types.map(x => x.toLowerCase()));
			break;
		case 'm':
		case 's':
			deck.shuffle();
			break;
		case 'Escape':
			deselectAll();
			break;
	}
}

function toggleGrid() {
	gridMode ^= true;
	document.body.classList.toggle('grid', gridMode);
	if (gridMode) {
		gridFunc = snapToGrid;
		for (let card of revealed) {
			card.snap();
		}
	} else {
		gridFunc = noGrid;
	}
	measureScreen();
}

function putOnBottom() {
	if (selected.size) {
		for (let card of selected) {
			deck.putOnBottom(card);
		}
		selected.clear();
	}
	if (grabbed != null) {
		deck.putOnBottom(grabbed);
	}
}

function replace() {
	if (selected.size) {
		// copy because we're going to be modifying selected
		let copy = Array.from(selected);
		for (let card of copy) {
			deck.replace(card);
		}
	} else if (grabbed != null) {
		deck.replace(grabbed);
	}
}

function selectAll() {
	if (!setsEqual(revealed, selected)) {
		for (let card of revealed) {
			selected.add(card);
			card.highlight();
		}
	} else {
		deselectAll();
	}
}

function drawCard(e) {
	if (grabbed) {
		grabbed.stop();
	}
	deck.draw(e);
}

function startSelectorBox(e) {
	deselectAll();
	grabbed = e.shiftKey ? GENERATOR_BOX : SELECTOR_BOX;
	grabbed.start(e);
}

function deselectAll() {
	for (let card of selected) {
		card.highlight(false);
	}
	selected.clear();
}

function start() {
	if (!ownedSets.size) {
		return;
	}
	ownedCards = [];
	for (let set of sets) {
		if (ownedSets.has(set.name)) {
			ownedCards.push(...set.cards);
		}
	}
	for (let promo of promos) {
		if (ownedPromos.has(promo.name)) {
			ownedCards.push(promo);
		}
	}
	shuffle(ownedCards);
	// ownedCards.sort((a, b) => a.text.length - b.text.length);
	saveSession();
	document.getElementById('modal').classList.add('hide');
	deck = newDeck(ownedCards);
}

var Card = {};

function init(json) {
	sets = json.sets;
	promos = json.promos;
	
	// stupid code
	for (let set of sets) {
		for (let card of set.cards) {
			Card[card.name.toLowerCase().replace(' ', '')] = card.name;
		}
	}
	for (let card of promos) {
		Card[card.name.toLowerCase().replace(' ', '')] = card.name;
	}
}

window.onload = function() {
	loadSession();
	measureScreen();
	updateStartButton();
	createSelectors(1, ownedSets,   sets,   'set');
	createSelectors(2, ownedPromos, promos, 'promo');
	SELECTOR_BOX = newSelectorBox(document.getElementById('selector-box'));
	GENERATOR_BOX = newGeneratorBox(document.getElementById('generator-box'));
	SEARCH_DIALOG = newSearchDialog();
	// document.getElementById('start-button').click();
}

window.onmouseup = release;
window.onmousemove = move;
window.onmousedown = startSelectorBox;

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

const CARD_TYPES = ["Action", "Treasure", "Victory", "Attack", "Duration", "Reaction", "Looter", "Knight", "Reserve", "Traveller", "Gathering", "Castle", "Night", "Fate", "Doom"];