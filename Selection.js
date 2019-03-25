class Selection extends Draggable {

	start(e) {
		for (let card of selected) {
			card.start(e);
		}
	}

	move(e) {
		for (let card of selected) {
			card.move(e);
		}
	}

	stop(e) {
		for (let card of selected) {
			card.stop(e);
		}
	}

}