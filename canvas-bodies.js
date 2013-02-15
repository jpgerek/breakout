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
	this.textLines 		= [];
	this.width 			= null;
	this.height 		= null;
	this.lineSpacing 	= 4;
	
	this.setFontSize(16);
	this.setFontType("helvetica");
	
	bodyColor && this.setBodyColor(bodyColor);
	borderColor && this.setBorderColor(borderColor);
	text && this.setText(text);
}




/**
 * Text's prototype
 */

Text.prototype = (function () {
	/*- Inheriting from Body -*/
	var prototype = extend(Text, Body);
	
	function updateFont() {
		this.font = this.fontSize + "px " + this.fontType;
	}
	
	/**
	 * Hack to compute the size and height of the text.
	 * It has to be called each time the font or text changes.
	 */
	function computeSize() {
		/*
		 * If there is more than one line we have to look for the longest one to know what line should we check
		 * to get the text width.
		 */
		var longestLineWidth = 0;
		if (this.textLines.length > 1) {
			for (var i in this.textLines) {
				var lineWidth = this.context.measureText(this.textLines[i]).width;
				if (lineWidth > longestLineWidth) {
					longestLineWidth = lineWidth;
				}
			}
		}
		this.width = longestLineWidth;
		this.height = this.textLines.length * (this.fontSize + this.lineSpacing - 1);
	}
	
	prototype.draw = function () {
		var ctx = this.context;
		ctx.fillStyle = this.bodyColor;
		ctx.strokeStyle = this.borderColor;
		ctx.beginPath();
		ctx.font = this.font;
		for (var i in this.textLines) {
			var line = this.textLines[i];
			ctx.fillText(line, this.getPosition().getX(), this.getPosition().getY() + (i * (this.fontSize + this.lineSpacing)));
		}
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		return this;
	};
	
	prototype.setText = function (text) {
		this.textLines = text.split(/\r?\n/);
		/*- Reseting text size properties -*/
		this.width = this.height = null;
		return this;
	};
	
	prototype.getText = function () {
		return this.text;
	};
	
	prototype.getWidth = function () {
		if (this.width === null) {
			/*- Lazy computing of the width and height -*/
			computeSize.call(this);
		}
		return this.width;
	};
	
	prototype.getHeight = function () {
		if (this.height === null) {
			/*- Lazy computing of the width and height -*/
			computeSize.call(this);
		}
		return this.height;
	};
	
	prototype.setFontSize = function (num) {
		this.fontSize = num;
		/*- Reseting text size properties -*/
		this.width = this.height = null;
		updateFont.call(this);
		return this;
	};
	
	prototype.getFontSize = function () {
		return this.fontSize;
	};
	
	prototype.setFontType = function (fontType) {
		this.fontType = fontType;
		/*- Reseting text size properties -*/
		this.width = this.height = null;
		updateFont.call(this);
		return this;
	};
	
	prototype.getFontType = function () {
		return this.fontType;
	};
	
	return prototype;
})();