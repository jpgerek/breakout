/**
 * Vector class.
 */

function Vector2D(x, y) {
	this.setX(x);
	this.setY(y);
}

Vector2D.prototype = (function () {
	var prototype = {};
	
	prototype.getX = function () {
		return this.x;
	};
	
	prototype.getY = function () {
		return this.y;
	};
	
	prototype.setX = function (x) {
		if (isNaN(x)) {
			throw Error('Error, is not a number: ' + x);
		}
		this.x = x;
		return this;
	};
	
	prototype.setY = function (y) {
		if (isNaN(y)) {
			throw new Error('Error, is not a number: ' + y);
		}
		this.y = y;
		return this;
	};
	
	prototype.add = function (vector) {
		this
			.setX(this.getX() + vector.getX())
			.setY(this.getY() + vector.getY());
		return this;
	};
	
	prototype.substract = function (vector) {
		this
			.setX(this.getX() - vector.getX())
			.setY(this.getY() - vector.getY());
		return this;
	};
	
	prototype.multiply = function (vector) {
		this.setX(this.getX() * vector.getX());
		this.setY(this.getY() * vector.getY());
		return this;
	};
	
	prototype.getDistance = function (vector) {
		return Math.sqrt(Math.pow(vector.x - this.x, 2), Math.pow(vector.y - this.y, 2));
	};
	
	prototype.invertX = function () {
		this.setX(this.x * -1);
		return this;
	};
	
	prototype.invertY = function () {
		this.setY(this.y * -1);
		return this;
	};
	
	return prototype;
})();