function newGeneratorBox(node) {

	let anchorX;
	let anchorY;
	let countAcross;
	let countDown;

	let box = {
		
		start: function(e) {
			measureScreen();
			node.classList.remove('hide');
			node.style.zIndex = topZIndex;
			anchorX = e.clientX;
			anchorY = e.clientY;
			this.move(e);
		},
		
		move: function(e) {
			setPosition(e.clientX, e.clientY);
		},
	
		stop: function(e) {
			node.classList.add('hide');
			let x = Math.min(e.clientX, anchorX);
			let y = Math.min(e.clientY, anchorY);
			let total = countAcross * countDown;
			deck.placeGroup(x, y, countDown, total, true);
		}
	};
	
	function getCount(pos, start, dim) {
		return Math.max(Math.ceil(Math.abs(pos - start) / dim), 1);
	}

	function setPosition(x, y) {
		countAcross = getCount(x, anchorX, CARD_WIDTH);
		countDown = getCount(y, anchorY, CARD_HEIGHT);
		
		node.style.width = countAcross * CARD_WIDTH + 'px';
		node.style.height = countDown * CARD_HEIGHT + 'px';
		
		node.style.transform = 'translate('
				+ gridFunc(Math.min(x, anchorX)) + 'px, '
				+ gridFunc(Math.min(y, anchorY)) + 'px)';
		let count = countAcross * countDown;
		node.innerText = count;
	}
	
	return box;
}