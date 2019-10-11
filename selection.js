function Selection() {
	
	this.start = function(e) {
		let inOrder = [...selected];
		inOrder.sort((t1, t2) => t1.getZ() - t2.getZ());
		for (let tile of inOrder) {
			tile.start(e);
		}
	};

	this.move = function(e) {
		for (let tile of selected) {
			tile.move(e);
		}
	};

	this.stop = function(e) {
		for (let tile of selected) {
			tile.stop(e);
		}
	};
}

Selection.prototype = new DefaultGrab();
