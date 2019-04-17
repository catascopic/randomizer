function GeneratorBox(node) {

	let anchorX;
	let anchorY;
	let countAcross;
	let countDown;
	
	function getCount(pos, start, dim) {
		return Math.max(Math.ceil(Math.abs(pos - start) / dim), 1);
	}
	
	this.start = function(e) {
		measureScreen();
		node.classList.remove('hide');
		node.style.zIndex = topZIndex;
		anchorX = e.clientX;
		anchorY = e.clientY;
		this.move(e);
	};
	
	this.move = function(e) {
		let x = bound(e.clientX, 0, screenWidth  - CARD_WIDTH + 1);
		let y = bound(e.clientY, 0, screenHeight - CARD_HEIGHT + 1);
		
		countAcross = getCount(x, gridFunc(anchorX), CARD_WIDTH);
		countDown = getCount(y, gridFunc(anchorY), CARD_HEIGHT);

		node.style.width = `${countAcross * CARD_WIDTH}px`;
		node.style.height = `${countDown * CARD_HEIGHT}px`;
		node.style.transform = `translate(${gridFunc(Math.min(x, anchorX))}px, ${gridFunc(Math.min(y, anchorY))}px)`;
		node.innerText = countAcross * countDown;
	};

	this.stop = function(e) {
		node.classList.add('hide');
		deck.placeGroup(
				Math.min(bound(e.clientX, 0, screenWidth  - CARD_WIDTH),  anchorX), 
				Math.min(bound(e.clientY, 0, screenHeight - CARD_HEIGHT), anchorY), 
				countDown, countAcross * countDown, true);
	}
	
	this.cancel = function() {
		node.classList.add('hide');
		grabbed = null;
	};
}

GeneratorBox.prototype = new Grabbable();
