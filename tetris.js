function TetrisGame(container, options={}) {
	this.container = container;

	var cell_size = (container.clientWidth / 12);
	var num_rows  = Math.floor(container.clientHeight / cell_size);

	this.grid = [];
	for(var i = 0; i < num_rows; i++) {
		var grid_row = [];
		var dom_row = document.createElement("div");
		dom_row.className = "tetris-row";
		for(var j = 0; j < 12; j++) {
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

	this.pieces = {
		"I" : [[0, 0], [0, 1], [0, 2], [0, 3]],
		"J" : [[0, 0], [0, 1], [0, 2], [1, 2]],
		"L" : [[0, 0], [0, 1], [0, 2], [1, 0]],
		"O" : [[0, 0], [0, 1], [1, 0], [1, 1]],
		"S" : [[1, 0], [1, 1], [0, 1], [0, 2]],
		"T" : [[0, 0], [0, 1], [1, 1], [0, 2]],
		"Z" : [[0, 0], [0, 1], [1, 1], [1, 2]]
	}

	this.reset();

	var tg = this;
	this.game = setInterval(function() {
		tg.next_frame();
	}, 1000);

  container.onkeypress = function(e){
    e = e || window.event;
    tg.keypress(e);
  }
}

TetrisGame.prototype.reset = function() {
	this.score = 0;
	this.level = 1;
	for(var i = 0; i < this.grid.length; i++)
		for(var j = 0; j < this.grid[i].length; j++)
			this.grid[i][j].className = "tetris-cell";

	this.ondeck = this.get_piece();
	this.piece = this.get_piece();
}

TetrisGame.prototype.get_piece = function() {
	var tg = this;
	var keys = Object.keys(this.pieces);
	var type = keys[keys.length * Math.random() << 0];
	return {
		x         : 5,
		y         : 1,
		type      : type,
		shape     : tg.pieces[type],
		tg        : tg,
    is_moving : false,
    rotate    : function() {
      while(this.is_moving){}

      this.is_moving = true;

      var piece = this;
      var tg    = this.tg;

			this.shape.forEach(function(e) {
				var x = piece.x + e[1],
				    y = piece.y + e[0];
				tg.grid[y][x].className = "tetris-cell";
			});

      var new_shape = [];
      var legal = true;
      for(var i = 0; i < this.shape.length; i++) {
        var x = -this.shape[i][0] + this.x,
            y =  this.shape[i][1] + this.y;
        if(x < 0 || x >= 12 || y < 0 || y >= tg.grid.length ||
            tg.grid[y][x].className != "tetris-cell") {
          legal = false;
          break;
        }
        new_shape.push([this.shape[i][1], -this.shape[i][0]]);
      }

      if(legal)
        this.shape = new_shape;

			this.shape.forEach(function(e) {
				var x = piece.x + e[1],
				    y = piece.y + e[0];
				tg.grid[y][x].className = "tetris-cell tetris-" + piece.type;
			});

      this.is_moving = false;
    },
		move      : function(axis="y", distance=1) {
			var piece = this;
			var tg    = this.tg;

      while(this.is_moving){}

      is_moving = true;

			this.shape.forEach(function(e) {
				var x = piece.x + e[1],
				    y = piece.y + e[0];
				tg.grid[y][x].className = "tetris-cell";
			});
			
			for(var i = 0; i < this.shape.length; i++) {
				var x = this.x + this.shape[i][1],
				    y = this.y + this.shape[i][0];
        if(axis == "x")
          x += distance;
        else if(axis == "y")
          y += distance;

        if(x < 0 ||
            x >= 12 ||
            y < 0 ||
            y >= tg.grid.length ||
            tg.grid[y][x].className != "tetris-cell") {
          distance = 0;
          break;
        }
			}

      if(axis == "x")
        this.x += distance;
      else if(axis == "y")
        this.y += distance;

			this.shape.forEach(function(e) {
				var x = piece.x + e[1],
				    y = piece.y + e[0];
				tg.grid[y][x].className = "tetris-cell tetris-" + piece.type;
			});

      is_moving = false;

			return distance;

		}
	};
}

TetrisGame.prototype.next_frame = function() {
	if(! this.piece.move()) {
		this.piece = this.ondeck;
		this.ondeck = this.get_piece();
    this.checkscore();
	}
}

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
      this.piece  = this.ondeck;
      this.ondeck = this.get_piece();
      this.checkscore();
    }
  }
}

TetrisGame.prototype.checkscore = function() {
  var tg = this;
  tg.piece.shape.forEach(function(e) {
    var x = e[1] + tg.piece.x,
        y = e[0] + tg.piece.y;

    tg.grid[y][x].className = "tetris-cell";
  });

  for(var y = 0; y < tg.grid.length; y++) {
    var full = true;
    for(var x = 0; x < tg.grid[y].length && full; x++) {
      full = tg.grid[y][x].className != "tetris-cell";
    }

    if(full) {
      this.score += 100;
      for(var y1 = y; y1 > 0; y1--)
        for(var x  = 0; x < tg.grid[y1].length; x++)
          tg.grid[y1][x].className = tg.grid[y1 - 1][x].className;
    }
  }

  tg.piece.shape.forEach(function(e) {
    var x = e[1] + tg.piece.x,
        y = e[0] + tg.piece.y;

    tg.grid[y][x].className = "tetris-cell tetris-"+tg.piece.type;
  });

}
