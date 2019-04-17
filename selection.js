function Selection() {
	
	this.start = function(e) {
		for (let card of selected) {
			card.start(e);
		}
	};

	this.move = function(e) {
		for (let card of selected) {
			card.move(e);
		}
	};

	this.stop = function(e) {
		for (let card of selected) {
			card.stop(e);
		}
	};
	
	this.replace = replaceSelected;
	this.remove = removeSelected;
}

Selection.prototype = Object.create(Grabbable.prototype);
