'use strict';

const DEFAULT_GRAB = new DefaultGrab();
const TILE_WIDTH = 120;
const TILE_HEIGHT = TILE_WIDTH;
const GRID_SIZE = 20;
const ANY_SELECTED = 'any-selected';

var grabbed = DEFAULT_GRAB;
var revealed = new Set();
var selected = new Set();
var deck;
var SELECTOR_BOX;
var GENERATOR_BOX;
var SEARCH_DIALOG;
const SELECTION = new Selection();

var screenWidth;
var screenHeight;
var topZIndex = 0;

var gridMode = false;
var gridFunc = noGrid;

// selector vars
var sets;
var promos;
var ownedCards;

var ownedSets = new Set();
var ownedPromos = new Set();

var modal = null;
var cardLookup = {};

function noGrid(n) {
	return n;
}

function snapToGrid(n) {
	return nearestMultiple(n, GRID_SIZE);
}

function grab(event, target) {
	event.stopPropagation();
	grabbed = target;
	grabbed.start(event.clientX, event.clientY);
	measureScreen();
}

function measureScreen() {
	if (gridMode) {
		screenWidth  = lastMultiple(document.body.scrollWidth,  GRID_SIZE);
		screenHeight = lastMultiple(document.body.scrollHeight, GRID_SIZE);
	} else {
		screenWidth  = document.body.scrollWidth;
		screenHeight = document.body.scrollHeight;
	}
}

function shortcut(event) {
	switch (event.key.toLowerCase()) {

		case 'a': selectAll(); break;
		case 'delete':
		case 'd': grabbed.remove(); break;
		case 'g': toggleGrid(); break;
		case 'l': promptLoad(); break;
		case 'm': deck.shuffle(); break;
		case 'n': startSession(); break;
		case 'o': organize(); break;
		case 'q': search(); break;
		case 'r': grabbed.replace(); break;
		case 's': promptSave(); break;
		case 't': displayText(); break;
		case 'z': grabbed.sendToBack(); break;

		case 'escape': cancel(); break;
		case 'backspace': /* stop back button */ break;

		case 'arrowup':    shiftSelected( 0, -1); break;
		case 'arrowdown':  shiftSelected( 0,  1); break;
		case 'arrowleft':  shiftSelected(-1,  0); break;
		case 'arrowright': shiftSelected( 1,  0); break;

		default: return;
	}
	event.preventDefault();
}

function toggleGrid() {
	gridMode ^= true;
	document.body.classList.toggle('grid', gridMode);
	if (gridMode) {
		gridFunc = snapToGrid;
		for (let tile of revealed) {
			tile.snap();
		}
	} else {
		gridFunc = noGrid;
	}
	measureScreen();
}

function selectAll() {
	if (!setsEqual(revealed, selected)) {
		for (let tile of revealed) {
			tile.select(true);
		}
		updateAnySelected();
	} else {
		deselectAll();
	}
}

function updateAnySelected() {
	document.body.classList.toggle(ANY_SELECTED, selected.size);
}

function drawCard(event) {
	grabbed.stop();
	deck.draw(event);
}

function cancel() {
	grabbed.cancel();
	deselectAll();
}

function deselectAll() {
	for (let tile of selected) {
		// only removes highlighting, then we'll just clear the selected set
		tile.deselectUnsafe();
	}
	clearSelected();
}

function clearSelected() {
	selected.clear();
	document.body.classList.remove(ANY_SELECTED);
}

async function displayText() {
	let tiles = selected.size ? selected : revealed;
	await navigator.clipboard.writeText([...tiles].map(t => t.getName()).join('\n'));
}

function shiftSelected(deltaX, deltaY) {
	if (selected.size) {
		let coef = gridMode ? GRID_SIZE : 1;
		for (let tile of selected) {
			tile.shift(coef * deltaX, coef * deltaY);
		}
	}
}

function loadState(state) {
	deck = new Deck(state.deck.map(name => cardLookup[name]));
	for (let card of state.cards) {
		loadTile(card);
	}
}

function getState() {
	return {
		cards: Array.from(revealed).map(tile => tile.save()),
		deck: deck.save(),
		date: Date.now()
	};
}

function startSession() {
	show(document.getElementById('start'));
	updateStartButton();
}

function promptSave() {
	show(document.getElementById('save'));
}

function defaultStart(modal) {
	if (!revealed.size) {
		if (ownedSets.size) {
			start();
		}
	} else {
		hide(modal);
	}
}

function start() {
	for (let tile of revealed) {
		tile.clear();
	}
	revealed.clear();
	
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
	saveSettings();
	hide(document.getElementById('start'));
	deck = new Deck(ownedCards);
}

function init(json) {
	sets = json.sets;
	promos = json.promos;
	for (let set of sets) {
		for (let card of set.cards) {
			cardLookup[card.name] = card;
		}
	}
	for (let promo of promos) {
		cardLookup[promo.name] = promo;
	}
}

window.onload = function() {
	measureScreen();
	let tempJson = localStorage.getItem('temp');
	loadSettings();
	if (tempJson == null) {
		startSession();
	} else {
		loadState(JSON.parse(tempJson));
	}
	createSelectors(1, ownedSets,   sets,   'set');
	createSelectors(2, ownedPromos, promos, 'promo');
	SELECTOR_BOX = new SelectorBox(document.getElementById('selector-box'));
	GENERATOR_BOX = new GeneratorBox(document.getElementById('generator-box'));
	// SEARCH_DIALOG = newSearchDialog();
}

window.onbeforeunload = function() {
	if (revealed.size) {
		localStorage.setItem('temp', JSON.stringify(getState()));
	}
};

window.onmousemove = function(event) {
	grabbed.move(event.clientX, event.clientY);
};

window.onmousedown = function(event) {
	// TODO: multiple selection boxes
	deselectAll();
	grabbed = event.shiftKey ? GENERATOR_BOX : SELECTOR_BOX;
	grabbed.start(event.clientX, event.clientY);
};

window.onmouseup = function(event) {
	grabbed.stop(event.clientX, event.clientY);
	grabbed = DEFAULT_GRAB;
};

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
		node.onclick = function(event) {
			let selected = !selectorSet.delete(item.name);
			if (selected) {
				selectorSet.add(item.name);
			}
			node.classList.toggle('selected', selected);
			updateStartButton();
			event.stopPropagation();
		};
		document.getElementById('selectors').appendChild(node);
	}
}

function loadSettings() {
	let settingsJson = localStorage.getItem('settings');
	if (settingsJson != null) {
		let settings = JSON.parse(settingsJson);
		ownedSets = new Set(settings.ownedSets);
		ownedPromos = new Set(settings.ownedPromos);
	}
}

function saveSettings() {
	localStorage.setItem('settings', JSON.stringify({
		ownedSets: Array.from(ownedSets),
		ownedPromos: Array.from(ownedPromos)
	}));
}
