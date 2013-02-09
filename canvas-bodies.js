/**
 * Body class.
 */
function Body(canvas, x, y, bodyColor, borderColor) {
	this.canvas = canvas;
	this.context = canvas.getContext('2d');
	this.x = x;
	this.y = y;
	this.bodyColor = bodyColor;
	this.borderColor = borderColor;
	this.deleteFromAnimation = false; // Flag to know if it has to be removed from the animation queue.
	/*--- Function to be overwritten if necessary ---*/
	this.movementsLogic = function () { };
	this.dx = this.dy = this.speed = 0;
}


/**
 * Circle class.
 */

function Circle(canvas, x, y, bodyColor, borderColor, speed, radius ) {
	/*- Calling parent's constructor -*/
	this.parent.apply(this, arguments);
	this.radius = radius || 10;
	this.speed = speed || 0;
}

/*- Inheriting from Body -*/
extend(Circle, Body);

/**
 * Circle's prototype
 */


Circle.prototype.draw = function () {
	/*- Drawing a circle -*/
	var ctx = this.context;
	ctx.fillStyle = this.bodyColor;
	ctx.strokeStyle = this.borderColor;
	ctx.beginPath();
	ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
};

/**
 * Rectangle class.
 */

function Rectangle(canvas, x, y, bodyColor, borderColor, width, height) {
	/*- Calling parent constructor -*/
	this.parent.apply(this, arguments);
	this.width = width || 0;
	this.height = height || 0;
}

/*- Inheriting from Body -*/
extend(Rectangle, Body);

/**
 * Rectangle's prototype.
 */


Rectangle.prototype.draw = function () {
	var ctx = this.context;
	ctx.fillStyle = this.bodyColor;
	ctx.strokeStyle = this.borderColor;
	ctx.beginPath();
	ctx.rect(this.x, this.y, this.width, this.height);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
};


/**
 * Text class
 */

function Text(canvas, x, y, bodyColor, borderColor, text) {
	/*- Calling parent constructor */
	this.parent.apply(this, arguments);
	this.text = text || '';
	this.font = "12px helvetica";
}

/*- Inheriting from Body -*/
extend(Text, Body);

/**
 * Text's prototype
 */

Text.prototype.draw = function () {
	var ctx = this.context;
	ctx.fillStyle = this.bodyColor;
	ctx.strokeStyle = this.borderColor;
	ctx.beginPath();
	ctx.font = this.font;
	ctx.fillText(this.text, this.x, this.y);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
}