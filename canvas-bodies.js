/**
 * Body class.
 */
function Body(canvas, vectorPosition, vectorSpeed) {
	this.setCanvas(canvas);
	this.setPosition(vectorPosition);
	this.setSpeed(vectorSpeed); // Speed vector.
	this.deleteFromAnimation = false; // Flag to know if it has to be removed from the animation queue.
	/*--- Function to be overwritten if necessary ---*/
	this.movementsLogic = function () { };
}

Body.prototype = (function () {
	var prototype = {};

	prototype.setCanvas = function (canvas) {
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
		return this;
	};
	
	prototype.getCanvas = function () {
		return this.canvas;
	};
	
	prototype.getContext = function () {
		return this.context;
	};
	
	prototype.goingUp = function () {
		return this.getSpeed().getY() < 0;
	};
	
	prototype.goingLeft = function () {
		return this.getSpeed().getX() < 0;
	};
	
	prototype.goingDown = function () {
		return this.getSpeed().getY() > 0;
	};
	
	prototype.goingRight = function () {
		return this.getSpeed().getX() > 0;
	};
	
	prototype.setPosition = function (vector) {
		this.position = vector;
		return this;
	};
	
	prototype.getPosition = function () {
		return this.position;
	};
	
	prototype.getSpeed = function () {
		return this.speed;
	};
	
	prototype.setSpeed = function (vector) {
		this.speed = vector;
		return this;
	};
	
	prototype.setBodyColor = function (color) {
		this.bodyColor = color;
		return this;
	};
	
	prototype.getBodyColor = function (color) {
		return this.bodyColor;
	};

	prototype.setBorderColor = function (color) {
		this.borderColor = color;
		return this;
	};
	
	prototype.getBorderColor = function (color) {
		return this.borderColor;
	};
	
	return prototype;
})();

/**
 * Circle class.
 */

function Circle(canvas, vectorPosition, vectorSpeed, radius) {
	/*- Calling parent's constructor -*/
	this.parent.apply(this, arguments);
	this.setRadius(radius);
}


/**
 * Circle's prototype
 */

Circle.prototype = (function () {
	/*- Inheriting from Body -*/
	var prototype = extend(Circle, Body);
	
	prototype.draw = function () {
		/*- Drawing a circle -*/
		var ctx = this.context;
		ctx.fillStyle = this.bodyColor;
		ctx.strokeStyle = this.borderColor;
		ctx.beginPath();
		ctx.arc(this.position.getX(), this.position.getY(), this.radius, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		return this;
	};
	
	prototype.getTop = function () {
		return this.position.getY() - this.getRadius();
	};
	
	prototype.getRight = function () {
		return this.position.getX() + this.getRadius();
	},
	
	prototype.getBottom = function () {
		return this.position.getY() + this.getRadius();
	};
	
	prototype.getLeft = function () {
		return this.position.getX() - this.getRadius();
	};
		
	prototype.getRadius = function () {
		return this.radius;
	};
	
	prototype.setRadius = function (radius) {
		this.radius = radius;
		return this;
	};
	
	return prototype;	
})();

/**
 * Rectangle class.
 */

function Rectangle(canvas, vectorPosition, vectorSpeed, width, height) {
	/*- Calling parent constructor -*/
	this.parent.apply(this, arguments);
	this.setWidth(width || 0);
	this.setHeight(height || 0);
}




/**
 * Rectangle's prototype.
 */


Rectangle.prototype = (function () {
	/*- Inheriting from Body -*/
	var prototype = extend(Rectangle, Body);
	
	prototype.draw = function () {
		var ctx = this.context;
		ctx.fillStyle = this.bodyColor;
		ctx.strokeStyle = this.borderColor;
		ctx.beginPath();
		ctx.rect(this.position.getX(), this.position.getY(), this.width, this.height);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		return this;
	};
	
	prototype.getTop = function () {
		return this.position.getY();
	};
	
	prototype.getRight = function () {
		return this.position.getX() + this.getWidth();
	};
	
	prototype.getBottom = function () {
		return this.position.getY() + this.getHeight();
	};
	
	prototype.getLeft = function () {
		return this.position.getX();
	};
	
	prototype.getWidth = function () {
		return this.width;
	};
	
	prototype.getHeight = function  () {
		return this.height;
	};
	
	prototype.setWidth = function (width) {
		this.width = width;
		return this;
	};
	
	prototype.setHeight = function (height) {
		this.height = height;
		return this;
	};
	
	return prototype;
})();


/**
 * Text class
 */

function Text(canvas, vectorPosition, vectorSpeed, bodyColor, borderColor, text) {
	/*- Calling parent constructor */
	this.parent.apply(this, arguments);
	this.text = text || '';
	this.font = "12px helvetica";
}




/**
 * Text's prototype
 */

Text.prototype = (function () {
	/*- Inheriting from Body -*/
	var prototype = extend(Text, Body);
	
	prototype.draw = function () {
		var ctx = this.context;
		ctx.fillStyle = this.bodyColor;
		ctx.strokeStyle = this.borderColor;
		ctx.beginPath();
		ctx.font = this.font;
		ctx.fillText(this.text, this.getPosition().getX(), this.getPosition().getY());
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	};
	
	return prototype;
})();