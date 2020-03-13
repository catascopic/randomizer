function Selection() {
	
	let offsetX;
	let offsetY;
	let area;
	
	this.start = function(x, y) {
		offsetX = x;
		offsetY = y;
		let inOrder = [...selected];
		inOrder.sort((t1, t2) => t1.getZ() - t2.getZ());
		area = {
			minX: Number.MAX_SAFE_INTEGER,
			minY: Number.MAX_SAFE_INTEGER,
			maxX: 0,
			maxY: 0
		};
		for (let tile of inOrder) {
			tile.start(x, y);
			tile.updateArea(area);
		}
	};

	this.move = function(x, y) {
		for (let tile of selected) {
			tile.move(x, y);
		}
	};

	this.stop = function(x, y) {
		for (let tile of selected) {
			tile.stop(x, y);
		}
	};
}

Selection.prototype = new DefaultGrab();
