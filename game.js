/**
 * Game class.
 */

function Game() {
	this.animationQueue 			= []; // List of objects to draw each loop.
	this.animationLoopActive 		= false;
	this.frameTimeStamp 			= 0;
	this.frameTimeDelta 			= 0;
	this.animationFrameReference 	= null;
}

Game.prototype = (function () {
	var prototype = Game.prototype;

	/*--- Constants ---*/
	var CANVAS_DEFAULT_WIDTH 		= 500,
		CANVAS_DEFAULT_HEIGHT 		= 300,
		FPS							= 60;
	
	
	/**
	 * Handling crossbrowser issues.
	 */
	function crossbrowserSupport() {
		// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
		// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

		// requestAnimationFrame polyfill by Erik Möller
		// fixes from Paul Irish and Tino Zijdel

		var lastTime = 0,
			vendors = ['ms', 'moz', 'webkit', 'o'];
		for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
		}
		
		if (!window.requestAnimationFrame)
			window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime(),
				timeToCall = Math.max(0, 16 - (currTime - lastTime)),
				id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
		
		if (!window.cancelAnimationFrame) {
			window.cancelAnimationFrame = function(id) {
				clearTimeout(id);
			};
		}
	}
	
	/**
	 * Draws objects in the canvas.
	 */
	function animationLoop(now) {
		/*
		 * now param implementation is not consistent across browsers: 
		 * - Chrome passes the time since the page got loaded or similar in milliseconds with decimals.
		 * - Firefox passes the timestamp in milliseconds and no decimals
		 * - Opera passes nothing (undefined).
		 * - IE I don't know and I don't care.
		 */
		
		var body,
			newQueue = [];
		
		now = (new Date()).getTime();
		this.frameTimeDelta = now - this.frameTimeStamp;
		this.frameTimeStamp = now;

		
		/*- Keeping the loop active -*/
		var callback = (function (self, me) {
			return function () {
				me.apply(self, arguments);
			};
		})(this, arguments.callee);
		
		/*- Keeping the loop active -*/
		this.animationFrameReference = requestAnimationFrame(arguments.callee.bind(this), this.canvas);
		
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
	 * It returns the number of time frames passed since the last time.
	 * In order to make time based speed you need to multiply speed by this value on every update triggered
	 * by requestAnimationFrame and add it to each objects position.
	 * The sum of all the values returned in a second should be 1.
	 */
	prototype.getFrameTimeDelta = function () {
		return this.frameTimeDelta / 1000;
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
		/*- Not restarting if it's already active -*/
		if (this.animationLoopActive) {
			return;
		}
		this.animationLoopActive = true;
		/*- Setting the frame time stamp one frame ago -*/
		this.frameTimeStamp = (new Date()).getTime() - (FPS / 1000);
		animationLoop.call(this, this.frameTimeStamp);
	};
	
	/**
	 * Stop animation loop.
	 */
	prototype.stopLoop = function () {
		/*- Not stopping if it's already stop -*/
		if (!this.animationLoopActive) {
			return;
		}
		this.animationLoopActive = false;
		cancelAnimationFrame(this.animationFrameReference);
	};
	
	/**
	 * Toggle animation loop.
	 */
	prototype.toogleLoop = function () {
		if (this.animationLoopActive) {
			this.stopLoop();
		} else {
			this.startLoop();
		}
	};
	
	prototype.isLoopActive = function () {
		return this.animationLoopActive;
	};
	
	return prototype;
})();