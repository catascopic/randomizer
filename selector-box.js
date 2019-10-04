function SelectorBox(node) {
	
	let startX;
	let startY;
	
	this.start = function(e) {
		show(node);
		node.style.zIndex = topZIndex;
		startX = e.clientX;
		startY = e.clientY;
		this.setPosition(startX, startY);
	};

	this.move = function(e) {
		this.setPosition(e.clientX, e.clientY);
		document.body.classList.add(ANY_SELECTED);
	};

	this.setPosition = function(x, y) {
		let boxX = Math.min(x, startX);
		let boxY = Math.min(y, startY);
		let boxWidth = Math.abs(x - startX);
		let boxHeight = Math.abs(y - startY);
		node.style.transform = `translate(${boxX}px, ${boxY}px)`;
		node.style.width = `${boxWidth}px`;
		node.style.height = `${boxHeight}px`;
		for (let tile of revealed) {
			tile.checkOverlap(boxX, boxY, boxWidth, boxHeight);
		}
		updateAnySelected();
	};
	
	function hideAndUpdate() {
		hide(node);
		updateAnySelected();
	}

	this.stop = hideAndUpdate;

	this.cancel = function() {
		hideAndUpdate()
		grabbed = DEFAULT_GRAB;
	};
}

SelectorBox.prototype = new Grabbable();
