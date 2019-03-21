function shuffle(array) {
	for (let i = array.length; i > 1; i--) {
		swap(array, i - 1, randInt(0, i));
	}
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function swap(array, i, j) {
	let temp = array[i];
	array[i] = array[j];
	array[j] = temp;
}
