function newSearchDialog() {
	let node = document.getElementById('search-modal');
	let grid = document.getElementById('search-grid');
	
	return {
		open: function() {
			let cards = deck.getContents();
			cards.sort((a, b) => b.name.localeCompare(a.name));
			for (let card of cards) {
				let node = cloneCard(card);
				node.classList
				grid.appendChild(node);
			}
			show(node);
		}
	};
}