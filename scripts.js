const body = document.body;
const modeContainer = document.getElementById("mode-container");
const difficultyContainer = document.getElementById("difficulty-container");
const easyButton = document.getElementById("easy");
const hardButton = document.getElementById("hard");
const gameContainer = document.getElementById("game-container");
const message = document.getElementById("message");
const cells = document.querySelectorAll(".cell");
const resetButton = document.createElement("button");
resetButton.textContent = "Restart game";
const playerPlayerButton = document.getElementById("player-player");
const playerComputerButton = document.getElementById("player-computer");
let mode = "";
let difficulty = "";


class Player {
    constructor(symbol) {
        this.symbol = symbol;
    }
}


const gameboard = (() => {
    const board = ["", "", "", "", "", "", "", "", ""];

    const getCellSymbol = (i) => {
        return board[i];
    };

    const changeCellSymbol = (i, symbol) => {
        board[i] = symbol;
    };

    const resetGameboard = () => {
        for (let i = 0; i < 9; i++) {
            board[i] = "";
        }
    };

    return { getCellSymbol, changeCellSymbol, resetGameboard };
})();


const playGame = (() => {
    const playerX = new Player("X");
    const playerO = new Player("O");
    let roundCounter = 1;

    // returns which players plays now
    const getCurrentSymbol = () => {
        if (roundCounter % 2 === 0) return playerO.symbol;
        else return playerX.symbol;    // X starts the game
    };

    // checks if any of win combinations is on the board
    const isWin = () => {
        const winCombinations = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ]

        for (let i = 0; i < winCombinations.length; i++) {
            let a = gameboard.getCellSymbol(winCombinations[i][0]);
            let b = gameboard.getCellSymbol(winCombinations[i][1]);
            let c = gameboard.getCellSymbol(winCombinations[i][2]);

            if (a !== "" && a === b && a === c) return true;
        }

        return false;
    };

    // checks for win or draw
    const checkGameStatus = () => {
        if (isWin()) {
            message.textContent = `${getCurrentSymbol()} wins`;
            displayController.displayResetButton();
            return;
        } 
        else if (roundCounter === 9) {
            message.textContent = "Draw";
            displayController.displayResetButton();
            return;
        } 
        
        roundCounter++;
        message.textContent = `${playGame.getCurrentSymbol()}'s turn`;
    };

    const resetGame = () => {
        gameContainer.removeChild(resetButton);
        roundCounter = 1;
        message.textContent = `${playGame.getCurrentSymbol()}'s turn`;
        gameboard.resetGameboard();
        displayController.updateGameboard();
        modeContainer.style.display = "flex"; 
        gameContainer.style.display = "none"; 
        startNewGame();
    };

    const makePlayerMove = (cell) => {
        gameboard.changeCellSymbol(cell, getCurrentSymbol());
        checkGameStatus();
    };

    const easyComputerMove = () => {
        let legalMoves = [];
        for (let i = 0; i < 9; i++) {
            if (gameboard.getCellSymbol(i) === "") legalMoves.push(i);
        }
        let randomChoice = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        gameboard.changeCellSymbol(randomChoice, playerO.symbol)
        checkGameStatus();
    };

    // helper function for hardComputerMove() based on a minimax algorithm
    const minimax = (board, depth, isMaximizing) => {
        if (playGame.isWin()) {
            if (isMaximizing) return -10 - depth;
            else return 10 - depth;
        }
    
        if (depth >= 5) {   // depth limit set to improve performance
            return 0;
        }
    
        let legalMoves = [];
        for (let i = 0; i < 9; i++) {
            if (board.getCellSymbol(i) === "") legalMoves.push(i);
        }
    
        if (isMaximizing) {
            let maxValue = -Infinity;
            for (let i of legalMoves) {
                board.changeCellSymbol(i, playerO.symbol);
                let value = minimax(board, depth + 1, false);
                board.changeCellSymbol(i, "");
                maxValue = Math.max(maxValue, value);
            }
            return maxValue;
        } 
        else {
            let minValue = Infinity;
            for (let i of legalMoves) {
                board.changeCellSymbol(i, playerX.symbol);
                let value = minimax(board, depth + 1, true);
                board.changeCellSymbol(i, "");
                minValue = Math.min(minValue, value);
            }
            return minValue;
        }
    };

    const hardComputerMove = () => {
        const legalMoves = [];
        for (let i = 0; i < 9; i++) {
            if (gameboard.getCellSymbol(i) === "") legalMoves.push(i);
        }

        let bestMoveValue = -Infinity;
        let bestMove = -1;

        for (let i of legalMoves) {
            gameboard.changeCellSymbol(i, playerO.symbol);   // simulates computer's move
            const moveValue = minimax(gameboard, 0, false);  // calculates the value of the move
            gameboard.changeCellSymbol(i, "");               // undos the simulated move

            // update the best move if the current move is better
            if (moveValue > bestMoveValue) {
                bestMoveValue = moveValue;
                bestMove = i;
            }
        }

        gameboard.changeCellSymbol(bestMove, playerO.symbol);
        checkGameStatus();
    };

    const makeComputerMove = () => {
        if (playGame.getCurrentSymbol() === playerO.symbol && !playGame.isWin()) {
            if (difficulty === "easy") easyComputerMove();
            else if (difficulty === "hard") hardComputerMove();
        }
    };

    return { getCurrentSymbol, isWin, resetGame, makePlayerMove, makeComputerMove };
})();


const displayController = (() => {
    let allowClicks = true;

    cells.forEach((cell) => {
        cell.addEventListener("click", (e) => {
            if (allowClicks && cell.textContent === "" && !playGame.isWin()) {
                playGame.makePlayerMove(Number(cell.dataset.cell));
                updateGameboard();
                if (mode === "player-computer") {
                    allowClicks = false;
                    setTimeout(() => {
                        playGame.makeComputerMove();
                        updateGameboard();
                        allowClicks = true;
                    }, 500);
                }
            }
        });

        // disables hover effect for cells while computer is making a move
        cell.addEventListener("mouseenter", () => {
            if (!allowClicks) {
                cell.classList.add("hover-disabled");
            }
        });

        cell.addEventListener("mouseleave", () => {
            cell.classList.remove("hover-disabled");
        });
    });

    resetButton.addEventListener("click", playGame.resetGame);

    const updateGameboard = () => {
        for (let i = 0; i < 9; i++) {
            currentSymbol = gameboard.getCellSymbol(i);
            cells[i].textContent = currentSymbol;
            if (currentSymbol === "X") {
                cells[i].classList.remove("o");
                cells[i].classList.add("x");
            }
            else if (currentSymbol === "O") {
                cells[i].classList.remove("x");
                cells[i].classList.add("o");
            }
        }
    };

    const displayResetButton = () => {
        gameContainer.appendChild(resetButton);
    };


    return { updateGameboard, displayResetButton };
})();


function startNewGame() {
    playerPlayerButton.addEventListener("click", function() {
        modeContainer.style.display = "none"; 
        gameContainer.style.display = "block";
        mode = "player-player";
    });
    
    playerComputerButton.addEventListener("click", function() {
        modeContainer.style.display = "none";
        mode = "player-computer";
        difficultyContainer.style.display = "flex";
        easyButton.addEventListener("click", function() {
            gameContainer.style.display = "block";
            difficultyContainer.style.display = "none";
            difficulty = "easy";
        })
        hardButton.addEventListener("click", function() {
            gameContainer.style.display = "block";
            difficultyContainer.style.display = "none";
            difficulty = "hard";
        })
    });
}

startNewGame();
message.textContent = `${playGame.getCurrentSymbol()}'s turn`;
displayController.updateGameboard();
