/**
 * Tetris Game.
 *
 * A challenge project (Week 3 of 2018).
 *
 * @author Adam Handen (ahanden@github)
 */

/**
 * Create a new game of tetris.
 *
 * This tetris game uses vanilla JS with CSS classes and should compatible with
 * almost all browsers (IE8+ too). The game is current set up to only recognize
 * arrow keys, so there's no mobile compatability.
 *
 * @constructor
 * @param {Node} container              The DOM node to contain the tetris
 *                                      game.
 * @param {int}  [options.cols=12]      The number of columns the game board
 *                                      is to have. Note that the number of
 *                                      ros is dependant on the container's
 *                                      height.
 * @param {Node} [options.score_board]  A DOM node to write the current score
 *                                      to. Note that this method will over-
 *                                      write the inner HTML of the given node.
 * @param {Node} [options.next_piece]   A DOM node to display the on-deck
 *                                      game piece.
 */
function TetrisGame(container, options={}) {
  this.container = container;
  this.cols = typeof options.cols  === "undefined" ? 12 : options.cols;
  this.score_board = options.score_board;
  this.piece_container = options.next_piece;

	// Compute the size of the grid cells and the number of rows.
  var cell_size = (container.clientWidth / this.cols);
  var num_rows  = Math.floor(container.clientHeight / cell_size);

	// Fill the ame grid
  this.grid = [];
  for(var i = 0; i < num_rows; i++) {
    var grid_row = [];
    var dom_row = document.createElement("div");
    dom_row.className = "tetris-row";
    for(var j = 0; j < this.cols; j++) {
      var cell = document.createElement("div");
      cell.style.width      = cell_size + "px";
      cell.style.paddingTop = cell_size + "px";
      dom_row.appendChild(cell);
      grid_row.push(cell);
      cell.className = "tetris-cell";
    }
    this.container.appendChild(dom_row);
    this.grid.push(grid_row);
  }

	// If options.next_piece was given, setup the region for the ondefck piece.
  if(typeof this.piece_container !== "undefined") {
    var container = this.piece_container;
    while(container.firstChild) {
      container.removeChild(container.firstChild);
    }

    this.ondeck_grid = [];
    for(var i = 0; i < 6; i++) {
      var grid_row = [];
      var dom_row  = document.createElement("div");
      dom_row.className = "tetris-row";
      for(var j = 0; j < 5; j++) {
        var cell = document.createElement("div");
        cell.style.width      = cell_size + "px";
        cell.style.paddingTop = cell_size + "px";
        dom_row.appendChild(cell);
        grid_row.push(cell);
        cell.className = "tetris-cell";
      }
      container.appendChild(dom_row);
      this.ondeck_grid.push(grid_row);
    }
  }

	// Define the piecce shapes and names.
  this.pieces = {
    "I" : [[0, 0], [0, 1], [0, 2], [0, 3]],
    "J" : [[0, 0], [0, 1], [0, 2], [1, 2]],
    "L" : [[0, 0], [0, 1], [0, 2], [1, 0]],
    "O" : [[0, 0], [0, 1], [1, 0], [1, 1]],
    "S" : [[1, 0], [1, 1], [0, 1], [0, 2]],
    "T" : [[0, 0], [0, 1], [1, 1], [0, 2]],
    "Z" : [[0, 0], [0, 1], [1, 1], [1, 2]]
  }

	// Setup the event listener for keyboard input.
  var tg = this;
  this.container.onkeypress = function(e){
    e = e || window.event;
    tg.keypress(e);
  }

	// Start the game.
  this.reset();

}

/**
 * Resets/restarts the game.
 */
TetrisGame.prototype.reset = function() {
	// Stop the game (if it's running)
  if(typeof this.game !== "undefined")
    clearInterval(this.game);

	// Reset the score board
  this.score = 0;
  if(typeof this.score_board !== "undefined") {
    this.score_board.innerHTML = "Score: 0";
  }
  
	// Clear the ame board
  for(var i = 0; i < this.grid.length; i++)
    for(var j = 0; j < this.grid[i].length; j++)
      this.grid[i][j].className = "tetris-cell";
  
	// Refill the piece quee
  this.ondeck = undefined;
  this.next_piece();

	// Restart the game
	var tg = this;
  this.game = setInterval(function() {
    tg.next_frame();
  }, 1000);
}

/**
 * Refills the piece queue.
 */
TetrisGame.prototype.next_piece = function() {
	// If there is no on-deck piece, fill both pieces.
  if(typeof this.ondeck == "undefined") {
    this.ondeck = this.get_piece();
    this.piece  = this.get_piece();
  }
	// Otherwise, move down the queue.
  else {
    this.piece  = this.ondeck;
    this.ondeck = this.get_piece();
  }

	// Update on-deck display area, if defined.
  if(typeof this.piece_container !== "undefined") {
    for(var i = 0; i < this.ondeck_grid.length; i++) {
      for(var j = 0; j < this.ondeck_grid[i].length; j++) {
        this.ondeck_grid[i][j].className = "tetris-cell";
      }
    }

    var grid  = this.ondeck_grid;
    var piece = this.ondeck;
    this.ondeck.shape.forEach(function(e){
      grid[e[0] + 1][e[1] + 1].className = "tetris-cell tetris-"+piece.type;
    });
  }

	// Check to see if the game has ended.
  this.check_end_game();
}

/**
 * Generates a new game piece.
 */
TetrisGame.prototype.get_piece = function() {
  var tg = this;
  var keys = Object.keys(this.pieces);
  var type = keys[keys.length * Math.random() << 0];
  return {
    x         : Math.floor(tg.cols / 2), // The current x position.
    y         : 1,                       // The current y position.
    type      : type,                    // The piece name.
    shape     : tg.pieces[type],         // Coordinates to define its shape.
    tg        : tg,                      // The parent game, for reference.
    is_moving : false,                   // Whether the piece is currently
		                                     // moving.
    rotate    : function() {             // Rotate's the piece 90 degrees.
			// All moving/rotating methods must wait their turn.
      while(this.is_moving){}

			// Block other moving/rotating methods.
      this.is_moving = true;

      var piece = this;
      var tg    = this.tg;

			// Clear the piece from the board.
      this.shape.forEach(function(e) {
        var x = piece.x + e[1],
            y = piece.y + e[0];
        tg.grid[y][x].className = "tetris-cell";
      });

			// Attempt to rotate  the piece.
      var new_shape = [];
      var legal = true;
      for(var i = 0; i < this.shape.length; i++) {
        var x = -this.shape[i][0] + this.x,
            y =  this.shape[i][1] + this.y;
        if(x < 0 || x >= this.tg.cols || y < 0 || y >= tg.grid.length ||
            tg.grid[y][x].className != "tetris-cell") {
          legal = false;
          break;
        }
        new_shape.push([this.shape[i][1], -this.shape[i][0]]);
      }

			// If the rotation worked, update the shape.
      if(legal)
        this.shape = new_shape;

			// Redraw the piece.
      this.shape.forEach(function(e) {
        var x = piece.x + e[1],
            y = piece.y + e[0];
        tg.grid[y][x].className = "tetris-cell tetris-" + piece.type;
      });

			// Release movement.
      this.is_moving = false;
    },
    move      : function(axis="y", distance=1) { // Move the piece
      var piece = this;
      var tg    = this.tg;

			// Wait until other methods are done moving this piece.
      while(this.is_moving){}

			// Block other methods.
      is_moving = true;

			// Clear this piece from the board.
      this.shape.forEach(function(e) {
        var x = piece.x + e[1],
            y = piece.y + e[0];
        tg.grid[y][x].className = "tetris-cell";
      });
      
			// Attempt the move.
      for(var i = 0; i < this.shape.length; i++) {
        var x = this.x + this.shape[i][1],
            y = this.y + this.shape[i][0];
        if(axis == "x")
          x += distance;
        else if(axis == "y")
          y += distance;

        if(x < 0 ||
            x >= this.tg.cols ||
            y < 0 ||
            y >= tg.grid.length ||
            tg.grid[y][x].className != "tetris-cell") {
          distance = 0;
          break;
        }
      }

			// Execute the move.
      if(axis == "x")
        this.x += distance;
      else if(axis == "y")
        this.y += distance;

			// Redraw the piece.
      this.shape.forEach(function(e) {
        var x = piece.x + e[1],
            y = piece.y + e[0];
        tg.grid[y][x].className = "tetris-cell tetris-" + piece.type;
      });

			// Release the movement.
      is_moving = false;

			// Return whether the piece moved.
      return distance;

    }
  };
}

/**
 * Moves the current piece down with gravity.
 */
TetrisGame.prototype.next_frame = function() {
  if(! this.piece.move()) {
    this.next_piece();
    this.check_score();
  }
}

/**
 * Keyboard listener for user movement.
 *
 * Left and right move the piece back and forth. Down accelerates gravity, and
 * up rotates the piece 90 degrees.
 *
 * @param {keypress} e  A keypress event.
 */
TetrisGame.prototype.keypress = function(e) {
  var axis, distance;

  if(e.keyCode == 37) {
    axis = "x";
    distance = -1;
  }
  else if(e.keyCode == 39) {
    axis = "x";
    distance = 1;
  }
  else if(e.keyCode == 40) {
    axis = "y";
    distance = 1;
  }
  else if(e.keyCode == 38) {
    this.piece.rotate();
  }
  if(typeof axis != "undefined" &&
      typeof distance != "undefined") {
    move = this.piece.move(axis, distance);
    if(axis == "y" && ! move) {
      this.next_piece();
      this.check_score();
    }
  }
}

/**
 * Check to see if the game is over. If so, the game will restart.
 */
TetrisGame.prototype.check_end_game = function() {
  var lost = false;
	
	// See if the new piece would overlap an existing piece.
  for(var i = 0; i < this.piece.shape.length && !lost; i++) {
    var x = this.piece.shape[i][1] + this.piece.x,
        y = this.piece.shape[i][0] + this.piece.y;

    lost = this.grid[y][x].className != "tetris-cell"
  }

	// If so, restart.
  if(lost) {
    this.reset();
  }
}

/**
 * Checks the board for complete rows and scores them.
 */
TetrisGame.prototype.check_score = function() {
  var tg = this;

	// Erase the current moving piece.
  tg.piece.shape.forEach(function(e) {
    var x = e[1] + tg.piece.x,
        y = e[0] + tg.piece.y;

    tg.grid[y][x].className = "tetris-cell";
  });

  var scored_rows = 0;

	// Go through each row an see if it scores.
  for(var y = 0; y < tg.grid.length; y++) {
    var full = true;
    for(var x = 0; x < tg.grid[y].length && full; x++) {
      full = tg.grid[y][x].className != "tetris-cell";
    }

		// If the row scores, shift all above rows down one.
    if(full) {
      scored_rows += scored_rows + 1;
      for(var y1 = y; y1 > 0; y1--)
        for(var x  = 0; x < tg.grid[y1].length; x++)
          tg.grid[y1][x].className = tg.grid[y1 - 1][x].className;
    }
  }

	// Redraw the moving piece.
  tg.piece.shape.forEach(function(e) {
    var x = e[1] + tg.piece.x,
        y = e[0] + tg.piece.y;

    tg.grid[y][x].className = "tetris-cell tetris-"+tg.piece.type;
  });
  
	// Compute the score.
  this.score += scored_rows * 100;

	if(scored_rows > 0) {
		// Update the score board.
		if(typeof this.score_board !== "undefined")
			this.score_board.innerHTML = "Score: "+this.score;

		// Increase the game speed.
		clearInterval(this.game);

		this.game = setInterval(function() {
			tg.next_frame();
		}, Math.exp(-this.score/5000) * 1000);
	}
}
