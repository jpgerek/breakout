/**
 * Game class.
 */

function Game() {
	this.animationQueue = []; // List of objects to draw each loop.
	this.animationLoopActive = false;
}

Game.prototype = (function () {
	var prototype = Game.prototype;

	/*--- Constants ---*/
	var CANVAS_DEFAULT_WIDTH 	= 500,
		CANVAS_DEFAULT_HEIGHT 	= 300;
	
	/**
	 * Handling crossbrowser issues.
	 */
	function crossbrowserSupport() {
		/**
		 * Provides requestAnimationFrame in a cross browser way.
		 * @author paulirish / http://paulirish.com/
		 */
		 
		if (!window.requestAnimationFrame) {
			window.requestAnimationFrame = (function () {
				return (
						window.webkitRequestAnimationFrame ||
						window.mozRequestAnimationFrame ||
						window.oRequestAnimationFrame ||
						window.msRequestAnimationFrame ||
						function ( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
							window.setTimeout(callback, 1000 / 60);
						}
					);
			})(); 
		}
		
	   if (!window.cancelAnimationFrame)
	        window.cancelAnimationFrame = function(id) {
	            clearTimeout(id);
	        };
	}
	
	/**
	 * Draws objects in the canvas.
	 */
	function animationLoop() {
		var body,
			newQueue = [];
		
		/*- Keeping the loop active -*/
		var callback = (function (self, me) {
			return function () {
				me.call(self);
			};
		})(this, arguments.callee);
		
		if (this.animationLoopActive) {
			/*- Keeping the loop active -*/
			this.animationFrameReference = requestAnimationFrame(callback, this.canvas);
		}
		
		/*- Clearing the canvas -*/
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		/*- Iterating the queue and calling the method draw -*/
		for (var i in this.animationQueue) {
			 body = this.animationQueue[i];
			if ('draw' in body) {
				body.draw();
			}
		}

		/*- Iterating the queue and calling the method movementsLogic -*/
		for (var j in this.animationQueue) {
			body = this.animationQueue[j];
			if ('movementsLogic' in body) {
				body.movementsLogic();
			}
		}
		
		/*- Removing bodies if needed */
		for (var k in this.animationQueue) {
			body = this.animationQueue[k];
			if (!body.deleteFromAnimation) {
				newQueue.push(body);
			} else {
				delete body;
			}
		}
		
		/*- Replace the old queue -*/
		this.animationQueue = newQueue;
	};
	
	
	/**
	 * Initializing function taking care of the canvas, adding it to the DOM and others.
	 */
	prototype.initialize = function (containerId, widthParam, heightParam) {
		/*- Checking if the container exists -*/
		this.container = document.getElementById(containerId);
		if (this.container === null) {
			throw Error('No container found with the id: "' + containerId + "'");
		}
		
		/*- Creating the game canvas and adding it to the container -*/
		this.canvas 				= document.createElement('canvas');
		this.canvas.width 			= widthParam || CANVAS_DEFAULT_WIDTH;
		this.canvas.height 			= heightParam || CANVAS_DEFAULT_HEIGHT;
		this.container.innerHTML 	= ""; // Erase other contents in the container.
		this.container.appendChild(this.canvas);
		
		/*- Getting canvas 2d context -*/
		this.context = this.canvas.getContext('2d');
		
		/*- Taking care of crossbrowser issues -*/
		crossbrowserSupport();
	};
	
	/**
	 * Add body to the animation queue.
	 */
	prototype.addBody = function (body) {
		this.animationQueue.push(body);
	};
	
	/**
	 * Delete body from the animation queue.
	 */
	prototype.delBody = function (body) {
		body.deleteFromAnimation = true;
	};

	/**
	 * Reset the animation queue.
	 */
	prototype.resetAnimationQueue = function () {
		this.animationQueue = [];
	};
	
	/**
	 * Start animation loop.
	 */
	prototype.startLoop = function () {
		this.animationLoopActive = true;
		animationLoop.call(this);
	};
	
	/**
	 * Stop animation loop.
	 */
	prototype.stopLoop = function () {
		this.animationLoopActive = false;
		cancelAnimationFrame(this.animationFrameReference);
	};
	
	/**
	 * Toogle animation loop.
	 */
	prototype.toogleLoop = function () {
		if (this.animationLoopActive) {
			this.stopLoop();
		} else {
			this.startLoop();
		}
	};
	return prototype;
})();