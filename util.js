function validate(n) {
	if (n === undefined || n === null || (isNumber(n) && isNaN(n))) {
		throw 'invalid value: ' + n;
	}
	return n;
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function setsEqual(set1, set2) {
    if (set1.size !== set2.size) {
		return false;
	}
    for (let e of set1) {
		if (!set2.has(e)) {
			return false;
		}
	}
    return true;
}

function nearestMultiple(value, unit) {
	return Math.round(value / unit) * unit;
}

function lastMultiple(value, unit) {
	return Math.floor(value / unit) * unit;
}

function nextMultiple(value, unit) {
	return Math.ceil(value / unit) * unit;
}

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
