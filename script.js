const playerForm = document.getElementById('playerForm');
const startBtn = document.getElementById('startBtn');
const player1Input = document.getElementById('player1');
const player2Input = document.getElementById('player2');
const modeSelect = document.getElementById('modeSelect');
const gameArea = document.getElementById('gameArea');
const boardDiv = document.getElementById('board');
const turnIndicator = document.getElementById('turnIndicator');
const scorePlayer1 = document.getElementById('scorePlayer1');
const scorePlayer2 = document.getElementById('scorePlayer2');
const resetBtn = document.getElementById('resetBtn');
const popup = document.getElementById('popup');
const winnerText = document.getElementById('winnerText');
const howBtn = document.getElementById('howToPlayBtn');
const howPopup = document.getElementById('howToPlayPopup');
const closeHow = document.getElementById('closeHowToPlay');

let board = [];
let currentPlayer = 1;
let player1Name = '';
let player2Name = '';
let scores = [0,0];
let isBot = false;

modeSelect.addEventListener('change', () => {
    if(modeSelect.value === 'bot'){
        player2Input.style.display = 'none';
        player2Input.value = 'Bot';
    } else {
        player2Input.style.display = 'inline-block';
        player2Input.value = '';
    }
});

startBtn.addEventListener('click', () => {
    const p1 = player1Input.value.trim();
    const p2 = modeSelect.value === 'bot' ? 'Bot' : player2Input.value.trim();

    if(!p1){
        alert('Please enter Player 1 name');
        return;
    }
    if(modeSelect.value === 'friend' && !p2){
        alert('Please enter Player 2 name');
        return;
    }

    player1Name = p1;
    player2Name = p2;
    isBot = modeSelect.value === 'bot';

    playerForm.style.display = 'none';
    gameArea.style.display = 'block';
    initBoard();
    updateTurn();

    if(isBot && currentPlayer===2) setTimeout(botMove, 500);
});

resetBtn.addEventListener('click', () => {
    board = [];
    boardDiv.innerHTML = '';
    gameArea.style.display = 'none';
    playerForm.style.display = 'block';
    popup.style.display = 'none';
    currentPlayer = 1;
});

howBtn.addEventListener('click', () => {
    howPopup.style.display = 'flex';
});

closeHow.addEventListener('click', () => {
    howPopup.style.display = 'none';
});

function initBoard(){
    boardDiv.innerHTML = '';
    board = Array.from({length:6}, ()=>Array(7).fill(0));
    for(let r=0;r<6;r++){
        for(let c=0;c<7;c++){
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener('click', handleCellClick);
            boardDiv.appendChild(cell);
        }
    }
}

function handleCellClick(e){
    if(currentPlayer===2 && isBot) return;
    const col = +e.target.dataset.col;
    dropInColumn(col);
}

function dropInColumn(col){
    for(let r=5;r>=0;r--){
        if(board[r][col]===0){
            board[r][col] = currentPlayer;
            const cell = document.querySelector(`.cell[data-row='${r}'][data-col='${col}']`);
            cell.classList.add(currentPlayer===1?'red':'yellow','animate');
            setTimeout(()=>cell.classList.remove('animate'),300);

            if(checkWin(r,col)){
                endGame(`${currentPlayer===1?player1Name:player2Name} Wins!`);
                return;
            }

            if(isBoardFull()){
                endGame("It's a Draw!");
                return;
            }

            currentPlayer = currentPlayer===1?2:1;
            updateTurn();

            if(currentPlayer===2 && isBot){
                setTimeout(botMove, 500);
            }
            return;
        }
    }
}

function updateTurn(){
    turnIndicator.textContent = `${currentPlayer===1?player1Name:player2Name}'s Turn`;
}

function botMove(){
    let validCols = [];
    for(let c=0;c<7;c++){
        if(board[0][c]===0) validCols.push(c);
    }
    let chosenCol = null;
    for(let col of validCols){
        let row = getNextRow(col);
        board[row][col] = 2;
        if(checkWin(row,col)){
            chosenCol = col;
        }
        board[row][col] = 0;
        if(chosenCol !== null) break;
    }

    if(chosenCol === null){
        for(let col of validCols){
            let row = getNextRow(col);
            board[row][col] = 1;
            if(checkWin(row,col)){
                chosenCol = col;
            }
            board[row][col] = 0;
            if(chosenCol !== null) break;
        }
    }

    // Random
    if(chosenCol === null){
        chosenCol = validCols[Math.floor(Math.random()*validCols.length)];
    }

    dropInColumn(chosenCol);
}

function getNextRow(col){
    for(let r=5;r>=0;r--){
        if(board[r][col]===0) return r;
    }
    return null;
}

function checkWin(r,c){
    const directions = [[0,1],[1,0],[1,1],[1,-1]];
    const player = board[r][c];
    for(let [dx,dy] of directions){
        let count=1;
        for(let i=1;i<4;i++){
            let x=r+i*dx, y=c+i*dy;
            if(x>=0 && x<6 && y>=0 && y<7 && board[x][y]===player) count++;
            else break;
        }
        for(let i=1;i<4;i++){
            let x=r-i*dx, y=c-i*dy;
            if(x>=0 && x<6 && y>=0 && y<7 && board[x][y]===player) count++;
            else break;
        }
        if(count>=4) return true;
    }
    return false;
}

function isBoardFull(){
    for(let r=0;r<6;r++){
        for(let c=0;c<7;c++){
            if(board[r][c]===0) return false;
        }
    }
    return true;
}

function endGame(message){
    winnerText.textContent = message;
    popup.style.display = 'flex';
    if(message.includes('Wins')){
        if(currentPlayer===1) scores[0]++;
        else scores[1]++;
        scorePlayer1.textContent = scores[0];
        scorePlayer2.textContent = scores[1];
    }
    setTimeout(()=>{
        popup.style.display='none';
        resetBtn.click();
    },1500);
}
