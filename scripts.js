const container = document.getElementById("container");
const message = document.getElementById("message");
const cells = document.querySelectorAll(".cell");
const resetButton = document.createElement("button");
resetButton.textContent = "Restart game";

// players
const Player = (symbol) => {
    this.symbol = symbol; 
};


// gameboard
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

// game
const playGame = (() => {
    const playerX = Player("X");
    const playersO = Player("O");
    let roundCounter = 1;
    let gameOver = false;

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
    }


    // X starts the game
    const getCurrentSymbol = () => {
        if (roundCounter % 2 === 0) return "O";
        else return "X";
    }

    const playRound = (cell) => {
        gameboard.changeCellSymbol(cell, getCurrentSymbol());

        if (isWin()) {
            gameOver = true;
            message.textContent = `${getCurrentSymbol()} wins`;
            displayController.displayResetButton();
            return
        }
        else if (roundCounter === 9) {
            gameOver = true;
            message.textContent = "Draw";
            displayController.displayResetButton();
            return
        }
        displayController.updateGameboard()
        roundCounter++;
        message.textContent = `${playGame.getCurrentSymbol()}'s turn`;
    }

    const resetGame = () => {
        container.removeChild(resetButton);
        roundCounter = 1;
        gameOver = false;
        message.textContent = `${playGame.getCurrentSymbol()}'s turn`;
        gameboard.resetGameboard();
        displayController.updateGameboard();
    }

    return { playRound, isWin, getCurrentSymbol, resetGame };
})();


// display
const displayController = (() => {
    cells.forEach((cell) => {
        cell.addEventListener("click", (e) => {
            if (e.target.textContent !== "" || playGame.isWin()) return;
            playGame.playRound(Number(e.target.dataset.cell));
            updateGameboard();
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
        container.appendChild(resetButton);
    }

    

    return { updateGameboard, displayResetButton };
})();


message.textContent = `${playGame.getCurrentSymbol()}'s turn`;
displayController.updateGameboard();