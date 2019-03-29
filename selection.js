function newSelection() {
	
	return {
		start: function(e) {
			for (let card of selected) {
				card.start(e);
			}
		},

		move: function(e) {
			for (let card of selected) {
				card.move(e);
			}
		},

		stop: function(e) {
			for (let card of selected) {
				card.stop(e);
			}
		}
	};

}