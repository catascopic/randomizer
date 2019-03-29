function newSelectorBox(node) {
	
	let startX;
	let startY;
	
	return {
		
		start: function(e) {
			node.classList.remove('hide');
			node.style.zIndex = topZIndex;
			startX = e.clientX;
			startY = e.clientY;
			this.setPosition(startX, startY);
		},

		move: function(e) {
			this.setPosition(e.clientX, e.clientY);
		},

		setPosition: function(x, y) {
			node.style.transform = 'translate('
					+ Math.min(x, startX) + 'px, '
					+ Math.min(y, startY) + 'px)';
			node.style.width = Math.abs(x - startX) + 'px';
			node.style.height = Math.abs(y - startY) + 'px';
			let boxX = Math.min(x, startX);
			let boxY = Math.min(y, startY);
			let boxWidth = Math.abs(x - startX);
			let boxHeight = Math.abs(y - startY);
			for (let card of revealed) {
				card.highlight(selected.has(card) || card.overlaps(boxX, boxY, boxWidth, boxHeight));
			}
		},

		stop: function(e) {
			node.classList.add('hide');
			let boxX = Math.min(e.clientX, startX);
			let boxY = Math.min(e.clientY, startY);
			let boxWidth = Math.abs(e.clientX - startX);
			let boxHeight = Math.abs(e.clientY - startY);
			for (let card of revealed) {
				if (card.overlaps(boxX, boxY, boxWidth, boxHeight)) {
					selected.add(card);
				}
			}
		}
	};

}
