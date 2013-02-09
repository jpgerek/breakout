/*--- Basic helper to do class inheritance ---*/
function extend(child, parent){
	function F() { };
	F.prototype = parent.prototype;
	child.prototype = new F();
	child.prototype.constructor = child;
	child.prototype.parent = parent;
	return child.prototype;
};