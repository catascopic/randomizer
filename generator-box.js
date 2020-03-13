function GeneratorBox(node) {

	let startX;
	let startY;
	let anchorX;
	let anchorY;
	let countAcross;
	let countDown;
	
	function tileCount(start, pos, tileDim, anchor, screenDim, tileDim) {
		return Math.max(
			Math.min(
				Math.ceil(Math.abs(start - pos) / tileDim), 
				Math.floor(Math.abs(start - (pos >= anchor ? screenDim  : 0)) / tileDim)
			), 1);
	}

	this.start = function(x, y) {
		measureScreen();
		node.style.zIndex = topZIndex;
		anchorX = x;
		anchorY = y;
		this.move(x, y);
		show(node);
	};

	this.move = function(x, y) {
		let minX;
		let maxX;
		let minY;
		let maxY;
		let startXOffset;

		if (x >= anchorX) {
			minX = 0;
			maxX = screenWidth - TILE_WIDTH;
		} else {
			minX = TILE_WIDTH;
			maxX = screenWidth;
		}
		if (y >= anchorY) {
			minY = 0;
			maxY = screenHeight - TILE_HEIGHT;
		} else {
			minY = TILE_HEIGHT;
			maxY = screenHeight;
		}
		
		startX = bound(gridFunc(anchorX), minX, maxX);
		startY = bound(gridFunc(anchorY), minY, maxY);
		
		countAcross = tileCount(startX, x, TILE_WIDTH,  anchorX, screenWidth,  TILE_WIDTH);
		countDown   = tileCount(startY, y, TILE_HEIGHT, anchorY, screenHeight, TILE_HEIGHT);

		if (x < anchorX) {
			startX -= countAcross * TILE_WIDTH;
		}
		if (y < anchorY) {
			startY -= countDown * TILE_HEIGHT;
		}

		node.style.transform = `translate(${startX}px, ${startY}px)`;
		node.style.width =  `${countAcross * TILE_WIDTH }px`;
		node.style.height = `${countDown   * TILE_HEIGHT}px`;
		node.innerText = countAcross * countDown;
	};

	this.stop = function() {
		hide(node);
		deck.placeGroup(startX, startY, countDown, countAcross * countDown, true);
	};
	
	this.cancel = function() {
		hide(node);
		grabbed = DEFAULT_GRAB;
	};
}

GeneratorBox.prototype = new Grabbable();
