function GeneratorBox(node) {

	let anchorX;
	let anchorY;
	let countAcross;
	let countDown;
	let startY;
	let startX;
	
	function getCount(pos, start, dim) {
		return Math.max(Math.ceil(Math.abs(pos - start) / dim), 1);
	}
	
	this.start = function(e) {
		measureScreen();
		node.style.zIndex = topZIndex;
		anchorX = e.clientX;
		anchorY = e.clientY;
		this.move(e);
		show(node);
	};
	
	this.move = function(e) {
		let x = bound(e.clientX, 0, screenWidth  - TILE_WIDTH);
		let y = bound(e.clientY, 0, screenHeight - TILE_HEIGHT);
		
		countAcross = getCount(x, gridFunc(anchorX), TILE_WIDTH);
		countDown = getCount(y, gridFunc(anchorY), TILE_HEIGHT);

		startX = gridFunc(anchorX);
		startY = gridFunc(anchorY);

		if (e.clientX < anchorX) {
			startX -= countAcross * TILE_WIDTH;
		}
		if (e.clientY < anchorY) {
			startY -= countDown * TILE_HEIGHT;
		}

		node.style.transform = `translate(${startX}px, ${startY}px)`;
		node.style.width =  `${countAcross * TILE_WIDTH }px`;
		node.style.height = `${countDown   * TILE_HEIGHT}px`;
		node.innerText = countAcross * countDown;
	};

	this.stop = function(e) {
		hide(node);
		deck.placeGroup(startX, startY, countDown, countAcross * countDown, true);
	};
	
	this.cancel = function() {
		hide(node);
		grabbed = DEFAULT_GRAB;
	};
}

GeneratorBox.prototype = new Grabbable();
