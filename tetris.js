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
	setInterval(function() {
		tg.next_frame();
	}, 1000);
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
	console.log(type);
	return {
		x     : 5,
		y     : 0,
		type  : type,
		shape : tg.pieces[type],
		tg    : tg,
		move  : function() {
			var piece = this;
			var tg    = this.tg;

			this.shape.forEach(function(e) {
				var x = piece.x + e[0],
				    y = piece.y + e[1];
				tg.grid[y][x].className = "tetris-cell";
			});
			
			var move = 1;
			for(var i = 0; i < this.shape.length; i++) {
				var x = this.x + this.shape[i][1],
				    y = this.y + this.shape[i][0] + 1;
				if(tg.grid[y][x].className != "tetris-cell" ||
						y >= tg.grid.length) {
					move = 0;
					break;
				}
			}

			this.y += move;

			this.shape.forEach(function(e) {
				var x = piece.x + e[0],
				    y = piece.y + e[1];
				tg.grid[y][x].className = "tetris-cell tetris-" + piece.type;
			});

			return move > 0;

		}
	};
}

TetrisGame.prototype.next_frame = function() {
	if(! this.piece.move()) {
		this.piece = this.ondeck;
		this.ondeck = this.get_piece();
	}
}
