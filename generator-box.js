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
		show(node);
		node.style.zIndex = topZIndex;
		anchorX = e.clientX;
		anchorY = e.clientY;
		this.move(e);
	};
	
	this.move = function(e) {
		let x;
		let y;
		countAcross;
		countDown;
		
		if (e.clientX < anchorX) {
			// TODO
		} else {
			x = bound(e.clientX, 0, screenWidth  - TILE_WIDTH + 1);
			countAcross = getCount(x, gridFunc(anchorX), TILE_WIDTH);
		}
		
		if (e.clientY < anchorY) {
			// TODO
		} else {
			y = bound(e.clientY, 0, screenHeight - TILE_HEIGHT + 1);
			countDown = getCount(y, gridFunc(anchorY), TILE_HEIGHT);
		}

		node.style.width =  `${countAcross * TILE_WIDTH }px`;
		node.style.height = `${countDown   * TILE_HEIGHT}px`;
		node.style.transform = `translate(${gridFunc(Math.min(x, anchorX))}px, ${gridFunc(Math.min(y, anchorY))}px)`;
		node.innerText = countAcross * countDown;
	};

	this.stop = function(e) {
		hide(node);
		deck.placeGroup(
				Math.min(bound(e.clientX, 0, screenWidth  - TILE_WIDTH),  anchorX), 
				Math.min(bound(e.clientY, 0, screenHeight - TILE_HEIGHT), anchorY), 
				countDown, countAcross * countDown, true);
	};
	
	this.cancel = function() {
		hide(node);
		grabbed = DEFAULT_GRAB;
	};
}

GeneratorBox.prototype = new Grabbable();
