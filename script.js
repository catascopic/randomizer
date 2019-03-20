'use strict';

var deck = [];
var revealed = [];

var grabbed = null;
var offsetX;
var offsetY;

var screenWidth;
var screenHeight;

var zIndex = 0;

const CARD_WIDTH = 120;
const CARD_HEIGHT = CARD_WIDTH;

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
				bound(e.clientX - offsetX, 0, screenWidth  - CARD_WIDTH),
				bound(e.clientY - offsetY, 0, screenHeight - CARD_HEIGHT));
	}
}

function bound(value, min, max) {
	return Math.min(Math.max(value, min), max);
}

function snap(value, min, max, gridSize) {
	return Math.min(Math.max(Math.round(value / gridSize) * gridSize, min), max);
}

function snapAll() {
	for (let card of revealed) {
		card.setPosition(Math.round(card.x / 20) * 20, Math.round(card.y / 20) * 20);
	}
}

function shortcut(e) {
	switch (e.key) {
		case 'g':
			snapAll();
			break;
		case 'b':
			if (grabbed != null) moveToBottom(grabbed);
			break;
		case 's':
			shuffle(deck);
			break;
	}
}

function drawCard(e) {
	if (deck.length) {
		let card = createCard(deck.pop());
		revealed.push(card);
		grab(e, card);
	}
	updateDeck();
}

function updateDeck() {
	document.getElementById('deck').innerText = 'deck (' + deck.length + ')';
}

function moveToBottom(card) {
	card.hide();
	deck.unshift(card.data);
	updateDeck();
	grabbed = null;
}

function init() {
	for (let i = 0; i < 52; i++) {
		deck.push(randomColor());
	}
}

window.onload = function() {
	updateDeck();
}

function createCard(color) {
	const node = document.createElement('div');
	const card = {
		x: 0,
		y: 0,
		data: color,
		setPosition: function(x, y) {
			this.x = x;
			this.y = y;
			node.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
		},
		hide: function() {
			node.remove();
		}
	};
	
	node.classList.add('card');
	node.style['z-index'] = zIndex++;
	node.style['color'] = color.text;
	node.style['background-color'] = color.name;
	node.innerText = color.name;
	node.onmousedown = function(e) {
		node.style['z-index'] = zIndex++;
		grab(e, card);
	};
	
	document.body.appendChild(node);
	return card;
}

function shuffle(array) {
	for (let i = array.length; i > 1; i--) {
		swap(array, i - 1, randInt(0, i));
	}
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function swap(array, i, j) {
	let temp = array[i];
	array[i] = array[j];
	array[j] = temp;
}
















