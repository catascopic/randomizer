function Grabbable() {
	this.start = nop;
	this.stop = nop;
	this.cancel = nop;
	this.replace = nop;
	this.remove = nop;
	this.sendToBack = nop;
};

function nop() {};
