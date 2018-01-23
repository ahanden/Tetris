# Tetris Game
This is a browser-based game of tetris that can easily be inserted into a
webpage with only a few lines of code.

## Setup
You will need both the JavaScript and CSS files from this repository included
in your header.

```HTML
<link href="style.css" rel="stylesheet" type="text/css" />
<script type="text/javascript" src="tetris.js"></script>
```

To create a tetris game, you will need a container with a defined height and
can be focused on (you can use `tabindex="0"` if using a div). You'll need
to pass this to the tetris game constructor. The easiest way to do this is
using the `body` element's `onload=` atribute.

```HTML
<body onload="new TetrisGame(document.getElementById('tetris-game'));">
```

## Configuration
You can customize your tetris game with the following options to the
constructor:

* `cols` - The number of columns the game should have (default=12)
* `score_board` - A DOM Node to contain the score board.
* `next_piece` - A DOM node to display the upcoming game piece.

Any or all of the parameters can be passed as an object following the game's
container.

```HTML
<body onload="new TetrisGame(document.getElementById('tetris-game'), {
    cols: 14,
    next_piece: document.getElementById('on-deck')
});">
```

You can also customize the appearance of the board and individual pieces by
modifing the `style.css` file.

## Demo
The `demo.html` file has an example of the tetris game implemented with a score
board and an on-deck piece display.
