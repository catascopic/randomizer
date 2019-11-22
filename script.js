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

function noGrid(n) {
	return n;
}

function snapToGrid(n) {
	return nearestMultiple(n, GRID_SIZE);
}

function grab(e, target) {
	e.stopPropagation();
	grabbed = target;
	grabbed.start(e);
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

function shortcut(e) {
	switch (e.key) {

		case 'a': selectAll(); break;
		case 'Delete': 
		case 'd': grabbed.remove(); break;
		case 'g': toggleGrid(); break;
		case 'o': organize(); break;
		case 'q': search(); break;
		case 'r': grabbed.replace(); break;
		case 's': deck.shuffle(); break;
		case 't': displayText(); break;
		case 'z': grabbed.sendToBack(); break;

		case 'Escape': cancel(); break;
		case 'backspace': /* stop back button */ break;

		case 'ArrowUp':    shiftSelected( 0, -1); break;
		case 'ArrowDown':  shiftSelected( 0,  1); break;
		case 'ArrowLeft':  shiftSelected(-1,  0); break;
		case 'ArrowRight': shiftSelected( 1,  0); break;

		default: return;
	}
	e.preventDefault();
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

function drawCard(e) {
	grabbed.stop();
	deck.draw(e);
}

function cancel() {
	hideModal();
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

function showModal(name) {
	hideModal();
	modal = document.getElementById(name);
	show(modal);
	show(modal.parentNode);
}

function hideModal() {
	if (modal) {
		hide(modal);
		hide(modal.parentNode);
	}
}

function shiftSelected(deltaX, deltaY) {
	if (selected.size) {
		let coef = gridMode ? GRID_SIZE : 1;
		for (let tile of selected) {
			tile.shift(coef * deltaX, coef * deltaY);
		}
	}
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
	saveSession();
	hide(document.getElementById('panel'));
	deck = new Deck(ownedCards);
}

function init(json) {
	sets = json.sets;
	promos = json.promos;
}

window.onload = function() {
	loadSession();
	measureScreen();
	updateStartButton();
	createSelectors(1, ownedSets,   sets,   'set');
	createSelectors(2, ownedPromos, promos, 'promo');
	SELECTOR_BOX = new SelectorBox(document.getElementById('selector-box'));
	GENERATOR_BOX = new GeneratorBox(document.getElementById('generator-box'));
	SEARCH_DIALOG = newSearchDialog();
	showModal('panel');
}

window.onmousemove = function(e) {
	grabbed.move(e);
};

window.onmousedown = function(e) {
	// TODO: multiple selection boxes
	deselectAll();
	grabbed = e.shiftKey ? GENERATOR_BOX : SELECTOR_BOX;
	grabbed.start(e);
};

window.onmouseup = function(e) {
	grabbed.stop(e);
	grabbed = DEFAULT_GRAB;
};

window.onbeforeunload = function() {
	if (revealed.size) {
		// return 'The current board will be lost.';
	}
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
