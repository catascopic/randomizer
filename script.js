var deck = [];

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
	grabbed.reveal();
	offsetX = e.clientX - grabbed.x;
	offsetY = e.clientY - grabbed.y;
	screenWidth = document.body.scrollWidth;
	screenHeight = document.body.scrollHeight;
	moved = false;
}

function release(e) {
	grabbed = null;
	if (!moved) {
		console.log('flip');
	}
}

function move(e) {
	if (grabbed) {
		grabbed.setPosition(
				bound(e.clientX - offsetX, 0, screenWidth  - CARD_WIDTH),
				bound(e.clientY - offsetY, 0, screenHeight - CARD_HEIGHT));
		moved = true;
	}
}

function bound(value, min, max) {
	return Math.min(Math.max(value, min), max);
}

function snap(value, min, max, gridSize) {
	return Math.min(Math.max(Math.round(value / gridSize) * gridSize, min), max);
}

function snapAll() {
	for (let card of deck) {
		card.setPosition(Math.round(card.x / 20) * 20, Math.round(card.y / 20) * 20);
	}
}

function shortcut(e) {
	switch (e.key) {
		case 'g':
			snapAll();
			break;
	}
}

function init() {}

window.onload = function() {
	for (let i = 0; i < 52; i++) {
		createCard(i);
	}
}

function createCard() {
	let cardNode = document.createElement('div');
	let color = randomColor();
	cardNode.classList.add('card');
	cardNode.style['z-index'] = zIndex++;
	cardNode.innerText = '???';

	let card = {
		x: 0,
		y: 0,
		setPosition: function(x, y) {
			this.x = x;
			this.y = y;
			cardNode.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
		},
		reveal: function() {
			cardNode.style['color'] = color.text;
			cardNode.style['background-color'] = color.name;
			cardNode.innerText = color.name;
		}
	};

	cardNode.onmousedown = function(e) {
		cardNode.style['z-index'] = zIndex++;
		grab(e, card);
	};
	document.body.appendChild(cardNode);
	deck.push(card);
}


















