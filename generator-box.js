function GeneratorBox(node) {

	let startX;
	let startY;
	let anchorX;
	let anchorY;
	let countAcross;
	let countDown;
	
	function getCount(pos, start, min, max, dim, log) {
		let boundPos = bound(pos, min, max);
		let distance = Math.abs(pos - start);
		let unitDistance = Math.ceil(distance / dim);
		let cap = Math.max(unitDistance, 1);
		if (log) console.log(start, pos, distance, unitDistance, cap);
		
		return cap;
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
		let minX;
		let maxX;
		let minY;
		let maxY;

		if (e.clientX >= anchorX) {
			minX = 0;
			maxX = screenWidth - TILE_WIDTH;
		} else {
			minX = TILE_WIDTH;
			maxX = screenWidth;
		}
		if (e.clientY >= anchorY) {
			minY = 0;
			maxY = screenHeight - TILE_HEIGHT;
		} else {
			minY = TILE_HEIGHT;
			maxY = screenHeight;
		}
		
		startX = bound(gridFunc(anchorX), minX, maxX);
		startY = bound(gridFunc(anchorY), minY, maxY);
		
		let maxTileHoriz = Math.floor(Math.abs(startX - (e.clientX >= anchorX ? screenWidth  : 0)) / TILE_WIDTH);
		let maxTileVert  = Math.floor(Math.abs(startY - (e.clientY >= anchorY ? screenHeight : 0)) / TILE_HEIGHT);
		
		countAcross = Math.min(Math.ceil(Math.abs(startX - e.clientX) / TILE_WIDTH), maxTileHoriz);
		countDown   = Math.min(Math.ceil(Math.abs(startY - e.clientY) / TILE_HEIGHT), maxTileVert);;

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
