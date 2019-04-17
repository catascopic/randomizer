function SelectorBox(node) {
	
	let startX;
	let startY;
	
	this.start = function(e) {
		node.classList.remove('hide');
		node.style.zIndex = topZIndex;
		startX = e.clientX;
		startY = e.clientY;
		this.setPosition(startX, startY);
	};

	this.move = function(e) {
		this.setPosition(e.clientX, e.clientY);
	};

	this.setPosition = function(x, y) {
		let boxX = Math.min(x, startX);
		let boxY = Math.min(y, startY);
		let boxWidth = Math.abs(x - startX);
		let boxHeight = Math.abs(y - startY);
		node.style.transform = `translate(${boxX}px, ${boxY}px)`;
		node.style.width = `${boxWidth}px`;
		node.style.height = `${boxHeight}px`;
		for (let card of revealed) {
			card.checkOverlap(boxX, boxY, boxWidth, boxHeight);
		}
	};

	this.stop = function(e) {
		node.classList.add('hide');
	};

	this.cancel = function() {
		node.classList.add('hide');
		grabbed = null;
	};
}

SelectorBox.prototype = new Grabbable();