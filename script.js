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

function noGrid(n) {
	return n;
}

function snapToGrid(n) {
	return nearestMultiple(n, GRID_SIZE);
}

function noDrag(e) {
	e.preventDefault();
}

function bound(value, min, max) {
	return Math.min(Math.max(value, min), max);
}

function grab(e, target) {
	e.stopPropagation();
	grabbed = target;
	grabbed.start(e);
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
	grabbed.stop(e);
	grabbed = DEFAULT_GRAB;
}

function move(e) {
	grabbed.move(e);
}

function shortcut(e) {
	switch (e.key) {
		case 'a': selectAll();    break;
		case 'd': grabbed.remove();  break;
		case 'g': toggleGrid();   break;
		case 'o': /* TODO: organize(); */     break;
		case 'q': /* TODO: search();   */     break;
		case 'r': grabbed.replace();      break;
		case 's': 
		case 'm': deck.shuffle(); break;
		case 'z': grabbed.sendToBack();   break;
		case 'Escape': cancel();  break;
		case 'Delete': grabbed.remove();  break;
		case 'backspace': break;
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
	if (grabbed) {
		grabbed.stop();
	}
	deck.draw(e);
}

function startSelectorBox(e) {
	// TODO: multiple selection boxes
	deselectAll();
	grabbed = e.shiftKey ? GENERATOR_BOX : SELECTOR_BOX;
	grabbed.start(e);
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

function shiftSelected(deltaX, deltaY) {
	if (selected.size) {
		let coef = gridMode ? GRID_SIZE : 1;
		for (let tile of selected) {
			tile.shift(coef * deltaX, coef * deltaY);
		}
	}
}

function updateStartButton(options) {
	document.getElementById('start-button').disabled = !anySelected(options);
}

function anySelected(options) {
	for (let option of options) {
		if (option.selected) {
			return true;
		}
	}
	return false;
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
	document.getElementById('modal').classList.add('hide');
	deck = new Deck(ownedCards);
}

function init(json) {
	sets = json.sets;
	promos = json.promos;
}

window.onload = function() {
	loadSession();
	measureScreen();
	SELECTOR_BOX = new SelectorBox(document.getElementById('selector-box'));
	GENERATOR_BOX = new GeneratorBox(document.getElementById('generator-box'));
	SEARCH_DIALOG = newSearchDialog();
}

window.onmouseup = release;
window.onmousemove = move;
window.onmousedown = startSelectorBox;

window.onbeforeunload = function() {
	if (revealed.size) {
		// return 'The current board will be lost.';
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

const CARD_TYPES = ['Action', 'Treasure', 'Victory', 'Attack', 'Duration', 'Reaction', 'Looter', 'Knight', 'Reserve', 'Traveller', 'Gathering', 'Castle', 'Night', 'Fate', 'Doom'];
