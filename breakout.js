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



/**
 * Breakout class prototype.
 */
Breakout.prototype = (function () {
	/*- Inheriting from Game -*/
	var prototype = extend(Breakout, Game);;
	
	/*--- Constants ---*/
	
	var	CANVAS_BG_COLOR			= "#CCE1FF",
		BALL_BODY_COLOR 		= "#FF1414",
		BALL_BORDER_COLOR 		= "#555555",
		BALL_RADIUS				= 10,
		BALL_SPEED				= 6,
		BALL_MAX_X_SPEED		= 4,
		
		SLIDER_BODY_COLOR 		= "#FFA600",
		SLIDER_BORDER_COLOR 	= "#555555",
		SLIDER_WIDTH 			= 120,
		SLIDER_HEIGHT			= 10,
		SLIDER_SPEED			= 10,
		SLIDER_MARGIN_BOTTOM 	= 25,
		SLIDER_LATERAL_MARGIN	= 1,
		SLIDER_FRICTION			= 1.2, // Ratio.
		
		BRICKS_BODY_COLOR 		= "#ffff00",
		BRICKS_BORDER_COLOR		= "#555555",
		BRICKS_ROWS				= 2,
		BRICKS_PER_ROW			= 5,
		POINTS_PER_BRICK		= 1,
		
		
		LEVEL_TEXT				= 'Level: ',
		POINTS_TEXT				= 'Points: ',
		TEXT_COLOR				= '#555555',
		POINTS_PER_LEVEL		= 15,
		
		/*- Level change ratios -*/
		BALL_SIZE_EACH_LEVEL	= 0.95,
		SLIDER_SIZE_EACH_LEVEL 	= 0.95,
		SLIDER_SPEED_EACH_LEVEL = 1.08,
		BALL_SPEED_EACH_LEVEL 	= 1.03;
	
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
				ballSpeed			= ball.getSpeed(),
				ballPosition		= ball.getPosition();

			/*- Updating balls position adding speed vector -*/
			ballPosition.add(ball.speed);
			
			/*- Checking bricks collisions -*/
			var newBricksList = [];
			for (var i in bricksList) {
				var brick 						= bricksList[i],
					ballBrickYBottomDistance 	= brick.getTop() - ball.getBottom(),
					ballBrickYTopDistance 		= ball.getTop() - brick.getBottom(),
					ballBrickXLeftDistance 		= brick.getLeft() - ball.getRight(),
					ballBrickXRightDistance 	= ball.getLeft() - brick.getRight();
				
				/*- Tracking where is the lowest brick -*/
				lowestBrickY = Math.max(brick.getBottom(), lowestBrickY);
					
				/*- Checking if the ball hits the bottom of a brick when going up -*/
				if (ballBrickYBottomDistance <= 0 && ballBrickYTopDistance <= 0 && ballBrickXLeftDistance <= 0 && ballBrickXRightDistance <= 0) {
					game.delBody(brick);
					if (ball.goingUp()) {
						ballSpeed.setY(Math.abs(ballSpeed.getY()));
					} else if (ball.goingRight()) {
						ballSpeed.setX(- 1 * Math.abs(ballSpeed.getX()));
					} else if (ball.goingLeft()) {
						ballSpeed.setX(Math.abs(ballSpeed.getX()));
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
					(ball.goingRight() && ball.getRight() >= ball.getCanvas().width) ||
					/*- Reverse the movement if it hits the left border -*/
					(ball.goingLeft() && ball.getLeft() <= 0)
				) {
					ballSpeed.invertX();
			} else if (ball.goingUp() && ball.getTop() <= 0) {
				/*- Reverse the movement if it hits the top border -*/
				ballSpeed.invertY();
			} else {
				var ballSliderLeftDistance = slider.getLeft() - ball.getRight(),
					ballSliderRightDistance = ball.getLeft() - slider.getRight();
				if (ball.goingDown() && ball.getBottom() >= slider.getTop() && (ballSliderLeftDistance <= 0 && ballSliderRightDistance <= 0)) {
					/*- Reverse the movement if it hits the top of the slider -*/
					ballSpeed.invertY();
					var ballSpeedX = ballSpeed.getX() * SLIDER_FRICTION;
					/*- Ensuring a maximum x speed -*/
					if (Math.abs(ballSpeedX) > BALL_MAX_X_SPEED) {
						ballSpeedX = BALL_MAX_X_SPEED;
						if (ball.goingLeft()) {
							ballSpeedX *= -1;
						}
					}
					ballSpeed.setX(ballSpeedX);
				} else if (ball.goingDown() && ball.getBottom() >= slider.getBottom()) {
					/*--- Game over case ---*/
					gameOver.call(game);
				}
			}
			
			/*--- Go to the next level if there aren't more bricks and make sure the ball is bellow the bricks ---*/
			var lastBrickBallMargin = 30;
			if (game.bricksList.length === 0 && ball.getTop() > (lowestBrickY + lastBrickBallMargin)) {
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
		var speed = this.getSpeed(),
			position = this.getPosition();
			
		var	speedXAbs = Math.abs(speed.getX()),
			thereIsMovement = false;
		/*- Checking slider controls -*/
		if (!this.moveRight && this.moveLeft) {
			speed.setX(-1 * speedXAbs);
			thereIsMovement = true;
		} 
		if (!this.moveLeft && this.moveRight) {
			speed.setX(speedXAbs);
			thereIsMovement = true;
		} 
		if ((position.getX() + this.getWidth() + SLIDER_LATERAL_MARGIN) >= this.getCanvas().width && this.goingRight()) {
			position.setX(this.getCanvas().width - this.getWidth() - SLIDER_LATERAL_MARGIN);
		}
		if ((position.getX() - SLIDER_LATERAL_MARGIN) <= 0 && this.goingLeft()) {
			position.setX(SLIDER_LATERAL_MARGIN);
		}
		if (thereIsMovement) {
			/*- Updating position -*/
			position.add(speed);
		}
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
			brickHeight 	= (this.canvas.height - (bricksMargin * (bricksRows+1))) / (4 * bricksPerRow),
			vector2DZero 		= new Vector2D(0, 0);
		for (var i = 0; i < bricksRows; i++ ) {
			for (var j = 0; j < bricksPerRow; j++) {
				var brickX 	= bricksMargin + ((bricksMargin + brickWidth) * j),
					brickY 	= bricksMargin + ((bricksMargin + brickHeight) * i),
					brick 	= new Rectangle(this.canvas, new Vector2D(brickX, brickY), vector2DZero, brickWidth, brickHeight);
					brick
						.setBodyColor(BRICKS_BODY_COLOR)
						.setBorderColor(BRICKS_BORDER_COLOR);
				this.bricksList.push(brick);
				this.addBody(brick);
			}
		}

		/*- Apply size reduction after the first level only -*/
		if (this.currentLevel > 0) {
			/*- Setting ball size and speed -*/
			this.ball.setRadius(this.ball.getRadius() * BALL_SIZE_EACH_LEVEL); // Reducing the size each level.
			
			/*- Setting slider size -*/
			this.slider.setWidth(this.slider.getWidth() * SLIDER_SIZE_EACH_LEVEL); // Reducing the size each level.
			this.slider.setHeight(this.slider.getHeight() * SLIDER_SIZE_EACH_LEVEL); // Reducing the size level.
			this.slider.getSpeed().multiply(new Vector2D(SLIDER_SPEED_EACH_LEVEL, 1)); // Increasing slider X speed each level.
			this.ball.getSpeed().multiply(new Vector2D(1, BALL_SPEED_EACH_LEVEL)); // Increasing ball Y speed each level.
			
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
		this.resetAnimationQueue();
		this.gameOver 		= false;
		this.currentLevel 	= 0;
		this.points			= 0;
		this.bricksList 	= [];
		
		/*--- Creating the slider ---*/
		
		var sliderX = (this.canvas.width - SLIDER_WIDTH) / 2,
			sliderY = this.canvas.height - SLIDER_HEIGHT - SLIDER_MARGIN_BOTTOM,
			slider = this.slider = new Rectangle(this.canvas, new Vector2D(sliderX, sliderY), new Vector2D(SLIDER_SPEED, 0), SLIDER_WIDTH, SLIDER_HEIGHT);
			slider
				.setBodyColor(SLIDER_BODY_COLOR)
				.setBorderColor(SLIDER_BORDER_COLOR);
		
		/*- Adding the slider to the animation queue -*/
		this.addBody(slider);
		
		/*- Setting slider's movements logic -*/
		slider.movementsLogic = sliderMovementsLogic;
		/*- Flags to control the movement of the slider -*/
		slider.moveLeft = slider.moveRight = false;
		
		/*--- Creating ball ---*/
		
		var ballX 			 	= (this.canvas.width - BALL_RADIUS) / 2, // centered.
			ballY				= (this.canvas.height - BALL_RADIUS) / 2, // centered.
			ballMaxSpeedXHalf 	= BALL_MAX_X_SPEED / 2,
			ballSpeedX 			= -ballMaxSpeedXHalf + Math.random() * BALL_MAX_X_SPEED;
		if (ballSpeedX > 0) {
			ballSpeedX += ballMaxSpeedXHalf;
		} else {
			ballSpeedX -= ballMaxSpeedXHalf;
		}
		var ball = this.ball = new Circle(this.canvas, new Vector2D(ballX, ballY), new Vector2D(ballSpeedX, BALL_SPEED), BALL_RADIUS);
		ball
			.setBodyColor(BALL_BODY_COLOR)
			.setBorderColor(BALL_BORDER_COLOR);
		
		/*- Setting ball's movements logic -*/
		ball.movementsLogic = getBallMovementsLogic(this);
		
		/*- Adding the ball to the animation queue -*/
		this.addBody(ball);
		
		/*- Level text */
		var levelX 		= 5,
			levelY 		= this.canvas.height - SLIDER_MARGIN_BOTTOM + 20,
			levelText 	= this.levelText = new Text(this.canvas, new Vector2D(levelX, levelY), new Vector2D(0, 0));
			levelText
				.setBodyColor(TEXT_COLOR)
				.setBorderColor(TEXT_COLOR);

		/*- Adding level text to the animation queue -*/
		this.addBody(levelText);
		
		/*- Points text -*/
		var pointsX = (this.canvas.width - 35) / 2,
			pointsY = levelY,
			pointsText = this.pointsText = new Text(this.canvas, new Vector2D(pointsX, pointsY), new Vector2D(0, 0));
			pointsText
				.setBodyColor(TEXT_COLOR)
				.setBorderColor(TEXT_COLOR);
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
		
		/*- Setting canvas background color -*/
		this.canvas.style.backgroundColor = CANVAS_BG_COLOR;
		
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