function DefaultGrab() {

	this.sendToBack = function() {
		for (let tile of selected) {
			tile.sendToBack();
		}
	};

	this.remove = function() {
		for (let tile of selected) {
			// removes tiles from view without deselecting them, since it's 
			// better to just clear the set afterward.
			tile.removeUnsafe();
		}
		clearSelected();
	};
	
	this.replace = function() {
		for (let tile of selected) {
			tile.replace();
		}
	};

}

DefaultGrab.prototype = new Grabbable();
