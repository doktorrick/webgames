const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 500; 
canvas.height = 500; 

const size = 8;
const gridSize = canvas.width / 8;
const canvasHeight = canvas.height;
const canvasWidth = canvas.width;
let selected = null;

let board = [
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 0, 2, 0, 2, 0, 2],
    [2, 0, 2, 0, 2, 0, 2, 0]
];

function drawPiece(row, col) {
    if (board[row][col] === 1) { 
        ctx.beginPath();
        ctx.arc(
            col * gridSize + gridSize / 2, 
            row * gridSize + gridSize / 2, 
            gridSize / 3, // Radius
            0,
            Math.PI * 2
        );
        ctx.fillStyle = "blue";
        ctx.fill();
    } else if (board[row][col] === 2) { 
        ctx.beginPath();
        ctx.arc(
            col * gridSize + gridSize / 2,
            row * gridSize + gridSize / 2,
            gridSize / 3,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = "green";
        ctx.fill();
    }
}

function drawLabelText(row, col) {
    const text = `(${row}, ${col})`;
    const textWidth = ctx.measureText(text).width;
    const textX = col * gridSize + (gridSize - textWidth) / 2;
    const textY = row * gridSize + (gridSize + 10) / 2;
    ctx.font = "12px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(text, textX, textY);
}

function drawCell(row, col) {
    ctx.fillStyle = (row + col) % 2 === 0 ? 'white' : 'red';
    ctx.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
}

function drawCellBorder(row, col) {
    ctx.strokeStyle = 'white'; 
    ctx.lineWidth = 1; 
    ctx.strokeRect(col * gridSize, row * gridSize, gridSize, gridSize);
}

function drawhighlight() {
    if(selected) {
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 4;
        ctx.strokeRect(selected.col * gridSize, selected.row * gridSize, gridSize, gridSize)
    }
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    for (let row = 0; row < size; row++) { // Loop through rows
        for (let col = 0; col < size; col++) { // Loop through columns
            drawCell(row, col);
            drawCellBorder(row, col);
            drawPiece(row, col);
            drawLabelText(row, col);
        }
    }
    drawhighlight();
}

function getCell(offsetX, offsetY) {
    return {
        row: Math.floor(offsetY / gridSize),
        col: Math.floor(offsetX / gridSize)
    }
}

function isValidMove(fromRow, fromCol, toRow, toCol) {
    const diffRow = Math.abs(toRow - fromRow);
    const diffCol = Math.abs(toCol - fromCol);

    if(diffRow === 1 && diffCol === 1) {
        return true;
    }
}

function movePiece(fromRow, fromCol, toRow, toCol) {
    board[toRow][toCol] = board[fromRow][fromCol];
    board[fromRow][fromCol] = 0;
}

function handleClick(event) {
    const rect = canvas.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    if (!(offsetX >= 0 && offsetX <= canvas.width) && !(offsetY >= 0 && offsetY <= canvas.height)) return;
    
    const { row, col } = getCell(offsetX, offsetY);
   
    if(selected) {
        const isValid = isValidMove(selected.row, selected.col, row, col);
        if(isValid) {
            movePiece(selected.row, selected.col, row, col);
        }
        selected = null;
    } else {
        selected = { row, col }
    }

    drawGrid();
}

drawGrid();

document.addEventListener("click", handleClick)