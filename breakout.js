/**
 * Breakout game class.
 */
function Breakout() {
	this.parent.apply(this, arguments);
	this.gameOver 		= null;
	this.currentLevel 	= null;
	this.points			= null;
	this.pointsText 	= null;
	this.levelText 		= null;
	this.bricksList 	= null;
	this.ball 			= null;
	this.slider 		= null;
}

/*- Inheriting from Game -*/
extend(Breakout, Game);

/**
 * Breakout class prototype.
 */
Breakout.prototype = (function () {
	var prototype = Breakout.prototype;
	
	/*--- Constants ---*/
	
	var	BALL_BODY_COLOR 		= "#FF1414",
		BALL_BORDER_COLOR 		= "#000000",
		BALL_RADIUS				= 10,
		BALL_SPEED				= 6,
		
		SLIDER_BODY_COLOR 		= "#6176FF",
		SLIDER_BORDER_COLOR 	= "#aadd00",
		SLIDER_WIDTH 			= 120,
		SLIDER_HEIGHT			= 10,
		SLIDER_SPEED			= 10,
		SLIDER_MARGIN_BOTTOM 	= 25,
		SLIDER_LATERAL_MARGIN	= 1,
		SLIDER_FRICTION			= 0.1,
		SLIDER_MAX_X_SPEED		= 0.7,
		
		BRICKS_BODY_COLOR 		= "#ffff00",
		BRICKS_BORDER_COLOR		= "#0FF0F0",
		BRICKS_ROWS				= 2,
		BRICKS_PER_ROW			= 5,
		POINTS_PER_BRICK		= 1,
		
		
		LEVEL_TEXT				= 'Level: ',
		POINTS_TEXT				= 'Points: ',
		TEXT_COLOR				= '#777777',
		POINTS_PER_LEVEL		= 15,
		
		/*- Change ratios -*/
		BALL_SIZE_EACH_LEVEL	= 0.95,
		SLIDER_SIZE_EACH_LEVEL 	= 0.95,
		SLIDER_SPEED_EACH_LEVEL = 1.10,
		BALL_SPEED_EACH_LEVEL 	= 1.05;
	
	/**
	 * Ball movements and collisions logic.
	 * This method is executed in the scope of a Ball.
	 */
	function getBallMovementsLogic(game) {
		/*- Tracking where is the lowest brick to know when we can load the next level -*/
		var lowestBrickY = 0;
		
		return function () {
			var slider 				= game.slider,
				bricksList 			= game.bricksList,
				ball 				= this,
				ballTop 			= ball.y - ball.radius,
				ballRight 			= ball.x + ball.radius,
				ballBottom 			= ball.y + ball.radius,
				ballLeft 			= ball.x - ball.radius,
				ballGoingUp 		= ball.dy < 0,
				ballGoingDown 		= ball.dy > 0,
				ballGoingLeft 		= ball.dx < 0,
				ballGoingRight 		= ball.dx > 0,
				sliderTop 			= slider.y,
				sliderRight 		= slider.x + slider.width,
				sliderBottom 		= slider.y + slider.height,
				sliderLeft 			= slider.x,
				sliderGoingRight 	= slider.dx > 0,
				sliderGoingLeft 	= slider.dx < 0;
				
			ball.x += ball.dx * ball.speed;
			ball.y += ball.dy * ball.speed;
			
			/*- Checking bricks collisions -*/
			var newBricksList = [];
			for (var i in bricksList) {
				var brick 						= bricksList[i],
					brickTop 					= brick.y,
					brickRight 					= brick.x + brick.width,
					brickBottom 				= brick.y + brick.height,
					brickLeft 					= brick.x,
					ballBrickYBottomDistance 	= brickTop - ballBottom,
					ballBrickYTopDistance 		= ballTop - brickBottom,
					ballBrickXLeftDistance 		= brickLeft - ballRight,
					ballBrickXRightDistance 	= ballLeft - brickRight;
				
				/*- Tracking where is the lowest brick -*/
				lowestBrickY = Math.max(brickBottom, lowestBrickY);
					
				/*- Checking if the ball hits the bottom of a brick when going up -*/
				if (ballBrickYBottomDistance <= 0 && ballBrickYTopDistance <= 0 && ballBrickXLeftDistance <= 0 && ballBrickXRightDistance <= 0) {
					game.delBody(brick);
					if (ballGoingUp) {
						ball.dy = Math.abs(ball.dy);
					} else if (ballGoingRight) {
						ball.dx = - 1 * Math.abs(ball.dx);
					} else if (ballGoingLeft) {
						ball.dx = Math.abs(ball.dx);
					}
					/*- Increase points after hitting a brick -*/
					increasePoints.call(game);
				} else {
					/*- No collision -*/
					newBricksList.push(brick);
				}
			}
			game.bricksList = newBricksList;
		
			if (
					/*- Reverse the movement if it hits the right border -*/
					(ballGoingRight && ballRight >= ball.canvas.width) ||
					/*- Reverse the movement if it hits the left border -*/
					(ballGoingLeft && ballLeft <= 0)
				) {
					ball.dx *= -1;
			} else if (ballGoingUp && ballTop <= 0) {
				/*- Reverse the movement if it hits the top border -*/
				ball.dy *= -1;
			} else if (ballGoingDown && ballBottom >= sliderTop && ball.x >= sliderLeft && ball.x <= sliderRight) {
				/*- Reverse the movement if it hits the top of the slider -*/
				ball.dy *= -1;
				if (sliderGoingRight) {
					ball.dx += SLIDER_FRICTION;
				}
				if (sliderGoingLeft) {
					ball.dx -= SLIDER_FRICTION;
				}
				if (Math.abs(ball.dx) > SLIDER_MAX_X_SPEED) {
					ball.dx = SLIDER_MAX_X_SPEED;
					if (ballGoingLeft) {
						ball.dx *= -1;
					}
				}
			} else if (ballGoingDown && ballBottom >= sliderBottom) {
				/*--- Game over case ---*/
				gameOver.call(game);
			}
			
			/*--- Go to the next level if there aren't more bricks ---*/
			if (game.bricksList.length === 0 && ballTop > (lowestBrickY+20)) {
				nextLevel.call(game);
			}
		};
	}
	
	/**
	 * Increase points.
	 */
	function increasePoints() {
		this.points += POINTS_PER_BRICK;
		this.pointsText.text = POINTS_TEXT + this.points;
	}
	
	/**
	 * Slider movements and collisions logic.
	 */
	function sliderMovementsLogic() {
		/*- Checking slider controls -*/
		if (!this.moveRight && this.moveLeft) {
			this.dx = -1;
		} 
		if (!this.moveLeft && this.moveRight) {
			this.dx = 1;
		} 
		if (!this.moveLeft && !this.moveRight){
			this.dx = 0;
		}
		if ((this.x + this.width + SLIDER_LATERAL_MARGIN) >= this.canvas.width && this.dx > 0) {
			this.x = this.canvas.width - this.width - SLIDER_LATERAL_MARGIN;
			this.dx = 0;
		}
		if ((this.x - SLIDER_LATERAL_MARGIN) <= 0 && this.dx < 0) {
			this.x = SLIDER_LATERAL_MARGIN;
			this.dx = 0;
		}
		this.x += this.dx * this.speed;
	}
	
	
	/**
	 * Game over.
	 */
	function gameOver() {
		this.gameOver = true;
		this.stopLoop();
		if (confirm('Game over! Do you want to start again?')) {
			start.call(this);
		} 	
	}
	
	/**
	 * Loads a level.
	 */
	function nextLevel() {
		/*- Creating bricks -*/
		var bricksRows 		= BRICKS_ROWS + this.currentLevel,
			bricksPerRow 	= BRICKS_PER_ROW + this.currentLevel,
			bricksMargin 	= this.ball.radius, // Half of the ball's width.
			brickWidth 		= (this.canvas.width - (bricksMargin * (bricksPerRow+1))) / bricksPerRow,
			brickHeight 	= (this.canvas.height - (bricksMargin * (bricksRows+1))) / (4 * bricksPerRow);
		for (var i = 0; i < bricksRows; i++ ) {
			for (var j = 0; j < bricksPerRow; j++) {
				var brickX 	= bricksMargin + ((bricksMargin + brickWidth) * j),
					brickY 	= bricksMargin + ((bricksMargin + brickHeight) * i),
					brick 	= new Rectangle(this.canvas, brickX, brickY, BRICKS_BODY_COLOR, BRICKS_BORDER_COLOR, brickWidth, brickHeight);
				this.bricksList.push(brick);
				this.addBody(brick);
			}
		}

		/*- Apply size reduction after the first level only -*/
		if (this.currentLevel > 0){
			/*- Setting ball size and speed -*/
			this.ball.radius 	*= BALL_SIZE_EACH_LEVEL; // Reducing the size 10% each level.
			
			/*- Setting slider size -*/
			this.slider.width 	*= SLIDER_SIZE_EACH_LEVEL; // Reducing the size 10% each level.
			this.slider.height 	*= SLIDER_SIZE_EACH_LEVEL; // Reducing the size 10% each level.
			this.slider.speed 	*= SLIDER_SPEED_EACH_LEVEL; // Increasing slider speed 15% each level.
			this.ball.speed 	*= BALL_SPEED_EACH_LEVEL; // Increasing ball speed 10% each level.
			
			/*- Increasing points when passing a level -*/
			this.points += POINTS_PER_LEVEL;
		}
		this.currentLevel++;
		/*- Updating level banner text -*/
		this.levelText.text = LEVEL_TEXT + this.currentLevel;
	}
	
	/**
	 * Start game.
	 */
	function start() {
		/*- Resting some game attributes -*/
		this.gameOver 		= false;
		this.currentLevel 	= 0;
		this.points			= 0;
		this.bricksList 	= [];
		this.resetAnimationQueue();
		
		/*--- Creating the slider ---*/
		
		var sliderX = (this.canvas.width - SLIDER_WIDTH) / 2,
			sliderY = this.canvas.height - SLIDER_HEIGHT - SLIDER_MARGIN_BOTTOM,
			slider = this.slider = new Rectangle(this.canvas, sliderX, sliderY, SLIDER_BODY_COLOR, SLIDER_BORDER_COLOR, SLIDER_WIDTH, SLIDER_HEIGHT);
		
		slider.speed = SLIDER_SPEED;
		
		/*- Adding the slider to the animation queue -*/
		this.addBody(slider);
		
		/*- Setting slider's movements logic -*/
		slider.movementsLogic = sliderMovementsLogic;
		/*- Flags to control the movement of the slider -*/
		slider.moveLeft = slider.moveRight = false;
		
		/*--- Creating ball ---*/
		
		var ballX 			= (this.canvas.width - BALL_RADIUS) / 2, // centered.
			ballY			= (this.canvas.height - BALL_RADIUS) / 2, // centered.
			ballDirectionX 	= -0.5 + Math.random();
			/*- Making sure the direction isn't very perpendicular -*/
			if (ballDirectionX > -0.2 && ballDirectionX < 0) {
				ballDirectionX -= 0.2;
			} else if (ballDirectionX > 0 && ballDirectionX < 0.2) {
				ballDirectionX += 0.2;
			}
			ballDirectionY	= 1;
			
		var ball = this.ball = new Circle(this.canvas, ballX, ballY, BALL_BODY_COLOR, BALL_BORDER_COLOR, BALL_SPEED, BALL_RADIUS);
		
		ball.dx = ballDirectionX;
		ball.dy = ballDirectionY;

		/*- Setting ball's movements logic -*/
		ball.movementsLogic = getBallMovementsLogic(this);
		
		/*- Adding the ball to the animation queue -*/
		this.addBody(ball);
		
		/*- Level text */
		var levelX 		= 5,
			levelY 		= this.canvas.height - SLIDER_MARGIN_BOTTOM + 20,
			levelText 	= this.levelText = new Text(this.canvas, levelX, levelY, TEXT_COLOR, TEXT_COLOR);

		/*- Adding level text to the animation queue -*/
		this.addBody(levelText);
		
		/*- Points text -*/
		var pointsX = (this.canvas.width - 35) / 2,
			pointsY = levelY,
			pointsText = this.pointsText = new Text(this.canvas, pointsX, pointsY, TEXT_COLOR, TEXT_COLOR);
			this.pointsText.text = POINTS_TEXT + this.points;
			
		/*- Adding points text to the animation queue -*/
		this.addBody(pointsText);
		
		/*- Loading level 1 */
		nextLevel.call(this);
		
		/*- Starting animation loop -*/
		this.startLoop();
	}
	
	/**
	 * Game initializer.
	 * 
	 */
	 prototype.initialize = function (containerId, widthParam, heightParam) {
		 var game = this;

		 /*-- Setting up game --*/
		this.parent.prototype.initialize.apply(this, arguments);
		
		/*--- User interaction keys ---*/
		
		document.addEventListener('keydown', function (event) {
			switch (event.which) {
				/*-- Stopping/starting the game when pressing space --*/
				case 32:
					if (!game.gameOver) {
						game.toogleLoop();
					}
				break;
				/*-- Binding left and right keys to move the slider and --*/
				case 37:
					/*- Moving to the left -*/
					game.slider.moveLeft = true;
				break;
				case 39:
					/*- Moving to the right -*/
					game.slider.moveRight = true;
				break;
			}
		}, false);
		
		/*- Stopping the slider when releasing the left and right keys -*/
		document.addEventListener('keyup', function (event) {
			switch (event.which) {
				case 37:
					/*- Stop sliding to the left -*/
					game.slider.moveLeft = false;
				break;
				case 39:
					/*- Stop sliding to the right -*/
					game.slider.moveRight = false;
				break;
			}
		}, false);

		/*- Starting the game -*/
		start.call(this);
	};
	
	return prototype;
})();