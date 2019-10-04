function Selection() {
	
	this.start = function(e) {
		for (let tile of selected) {
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

Selection.prototype = Object.create(DefaultGrab.prototype);
