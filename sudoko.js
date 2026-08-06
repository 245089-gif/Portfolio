//Load boards from file or manually
//Each array is [puzzle, solution]
const easy = [
  "6------7------5-2------1---362----81--96-----71--9-4-5-2---651---78----345-------",
  "685329174971485326234761859362574981549618732718293465823946517197852643456137298"
];
const medium = [
  "--9-------4----6-758-31----15--4-36-------4-8----9-------75----3-------1--2--3--",
  "619472583243985617587316924158247369926531478734698152891754236365829741472163895"
];
const hard = [
  "-1-5-------97-42----5----7-5---3---7-6--2-41---8--5---1-4------2-3-----9-7----8--",
  "712583694639714258845269173521436987367928415498175326184697532253841769976352841"
];

//Game state variables
var timer;
var timeRemaining;
var lives;
var selectedNum;
var selectedTile;
var disableSelect;
var solution;
var isPaused = false;
var gameOver = true; //true until the first game is started

window.onload = function () {
    //Run startGame function when button is clicked
    id("start-btn").addEventListener("click", startGame);

    //Pause / resume the current game
    id("pause-btn").addEventListener("click", togglePause);

    //Switch theme immediately, no need to start a new game
    id("theme-1").addEventListener("change", setTheme);
    id("theme-2").addEventListener("change", setTheme);
    setTheme();

    //Number pad only needs its listeners attached once (tiles are
    //rebuilt every game, so their listeners get added in generateBoard)
    let numbers = qsa("#number-container p");
    for (let i = 0; i < numbers.length; i++) {
        numbers[i].addEventListener("click", selectNumber);
    }
};

//Applies whichever theme radio button is currently checked
function setTheme() {
    if (id("theme-1").checked) {
        qs("body").classList.remove("dark");
        qs("body").classList.add("light");
    } else {
        qs("body").classList.remove("light");
        qs("body").classList.add("dark");
    }
}

function startGame() {
    hideMessage();

    //Choose board difficulty
    let board;
    if (id("diff-1").checked) board = easy;
    else if (id("diff-2").checked) board = medium;
    else board = hard;

    solution = board[1];

    //Reset lives, selections and re-enable play
    lives = 3;
    disableSelect = false;
    selectedNum = null;
    selectedTile = null;
    isPaused = false;
    gameOver = false;
    id("lives").textContent = "Lives Remaining: 3";
    id("pause-btn").textContent = "Pause";

    //Build board and start the countdown
    generateBoard(board[0]);
    startTimer();
}

function startTimer() {
    //Clear any timer left over from a previous game
    if (timer) clearInterval(timer);

    //Set time remaining based on input
    if (id("time-1").checked) timeRemaining = 180;
    else if (id("time-2").checked) timeRemaining = 300;
    else timeRemaining = 600;

    //Show the starting time immediately
    id("timer").textContent = timeConversion(timeRemaining);

    //Tick every second
    timer = setInterval(tick, 1000);
}

//One second of countdown; reused when resuming from pause
function tick() {
    timeRemaining--;
    id("timer").textContent = timeConversion(timeRemaining);
    //If no time remains, end the game
    if (timeRemaining === 0) {
        endGame(false, "Time's up! ⏰");
    }
}

//Pauses or resumes the current game
function togglePause() {
    if (gameOver) return; //nothing to pause before/after a game

    if (isPaused) {
        //Resume
        isPaused = false;
        disableSelect = false;
        id("pause-btn").textContent = "Pause";
        hideMessage();
        timer = setInterval(tick, 1000);
    } else {
        //Pause
        isPaused = true;
        disableSelect = true;
        id("pause-btn").textContent = "Resume";
        clearInterval(timer);
        showMessage("Paused ⏸", "paused");
    }
}

//Converts seconds into a MM:SS string
function timeConversion(time) {
    let minutes = Math.floor(time / 60);
    if (minutes < 10) minutes = "0" + minutes;
    let seconds = time % 60;
    if (seconds < 10) seconds = "0" + seconds;
    return minutes + ":" + seconds;
}

function generateBoard(board) {
    //Clear previous board/state
    clearPrevious();

    //Create 81 tiles
    for (let i = 0; i < 81; i++) {
        let tile = document.createElement("p");
        tile.id = "t" + i;
        tile.dataset.index = i;
        tile.classList.add("tile");

        if (board[i] !== "-") {
            //Pre-filled tile: show the number, lock it
            tile.textContent = board[i];
            tile.classList.add("given");
        } else {
            //Empty tile: player can click it
            tile.addEventListener("click", selectTile);
        }

        //Work out which of the 9 boxes (3x3 blocks) this tile sits in,
        //so neighbouring boxes get a slightly different shade
        let row = Math.floor(i / 9);
        let col = i % 9;
        let box = Math.floor(row / 3) * 3 + Math.floor(col / 3);
        tile.classList.add(box % 2 === 0 ? "box-a" : "box-b");

        //Thicker borders every 3 rows/columns to mark the 3x3 boxes
        if ((i > 17 && i < 27) || (i > 44 && i < 54)) {
            tile.classList.add("bottomBorder");
        }
        if ((i + 1) % 9 === 3 || (i + 1) % 9 === 6) {
            tile.classList.add("rightBorder");
        }

        id("board").appendChild(tile);
    }
}

//Called when the player clicks an empty tile
function selectTile() {
    if (disableSelect) return;

    if (selectedTile) selectedTile.classList.remove("selected");
    selectedTile = this;
    selectedTile.classList.add("selected");

    //If a number is already chosen, fill it in right away
    if (selectedNum) placeNumber();
}

//Called when the player clicks a number on the number pad
function selectNumber() {
    if (disableSelect) return;

    let numbers = qsa("#number-container p");
    for (let i = 0; i < numbers.length; i++) {
        numbers[i].classList.remove("selected");
    }
    this.classList.add("selected");
    selectedNum = this.textContent;

    //If a tile is already chosen, fill it in right away
    if (selectedTile) placeNumber();
}

//Places selectedNum into selectedTile and checks it
function placeNumber() {
    let index = selectedTile.dataset.index;
    selectedTile.textContent = selectedNum;
    selectedTile.classList.remove("incorrect", "correct");

    if (selectedNum === solution[index]) {
        selectedTile.classList.add("correct");
        checkWin();
    } else {
        selectedTile.classList.add("incorrect");
        loseLife();
    }

    //Deselect the tile so the same number can be placed elsewhere,
    //but keep it lit up on the number pad
    selectedTile.classList.remove("selected");
    selectedTile = null;
}

function loseLife() {
    lives--;
    id("lives").textContent = "Lives Remaining: " + lives;
    if (lives <= 0) {
        endGame(false, "Out of lives! 💔");
    }
}

//Checks every tile against the solution; ends the game if it's complete
function checkWin() {
    let tiles = qsa(".tile");
    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i].textContent !== solution[i]) return;
    }
    endGame(true, "Solved! Well done! 🎉");
}

function endGame(won, text) {
    clearInterval(timer);
    disableSelect = true;
    gameOver = true;
    showMessage(text, won ? "win" : "lose");
}

function showMessage(text, state) {
    let msg = id("message");
    msg.textContent = text;
    msg.classList.remove("hidden", "win", "lose", "paused");
    msg.classList.add(state);
}

function hideMessage() {
    id("message").classList.add("hidden");
}

function clearPrevious() {
    //Remove all existing tiles
    let tiles = qsa(".tile");
    for (let i = 0; i < tiles.length; i++) {
        tiles[i].remove();
    }

    //Stop any running timer
    if (timer) clearInterval(timer);

    //Deselect any numbers left highlighted from the previous game
    let numbers = qsa("#number-container p");
    for (let i = 0; i < numbers.length; i++) {
        numbers[i].classList.remove("selected");
    }

    //Clear selection state
    selectedTile = null;
    selectedNum = null;
}

//Helper functions
function id(id) {
    return document.getElementById(id);
}
function qs(selector) {
    return document.querySelector(selector);
}
function qsa(selector) {
    return document.querySelectorAll(selector);
}