const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 600; 
canvas.height = 600; 

const size = 8;
const gridSize = canvas.width / 8;
const canvasHeight = canvas.height;
const canvasWidth = canvas.width;
let selected = null;
let waitForRemove = null;

//2-, 1+

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
    } else if (board[row][col] === 3) { 
        ctx.beginPath();
        ctx.arc(
            col * gridSize + gridSize / 2,
            row * gridSize + gridSize / 2,
            gridSize / 3,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = "gold";
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

function drawNumberCell(row, col) {
    const text = (row + col) % 2 === 0? "": (4 * row) +  Math.ceil((row + col) / 2); 
    const textX = col * gridSize + 2; 
    const textY = row * gridSize + gridSize / 1.1; 
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

function drawHighlight() {
    if(selected) {
        if(selected.col < 0 || selected.col > 7) return;
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 4;
        ctx.strokeRect(selected.col * gridSize, selected.row * gridSize, gridSize, gridSize)
    }
}

function drawNeonHighlight() {
    if (selected) {
        if (selected.col < 0 || selected.col > 7) return;

        const x = selected.col * gridSize;
        const y = selected.row * gridSize;

        // Neon glow effect layers
        const glowColor = "yellow";
        ctx.lineWidth = 10;
        ctx.strokeStyle = "rgba(255, 255, 0, 0.3)"; // Outer glow
        ctx.strokeRect(x, y, gridSize, gridSize);

        ctx.lineWidth = 8;
        ctx.strokeStyle = "rgba(255, 255, 0, 0.5)"; // Mid glow
        ctx.strokeRect(x, y, gridSize, gridSize);

        ctx.lineWidth = 6;
        ctx.strokeStyle = "rgba(255, 255, 0, 0.7)"; // Inner glow
        ctx.strokeRect(x, y, gridSize, gridSize);

        // Solid highlight
        ctx.lineWidth = 4;
        ctx.strokeStyle = glowColor; // Solid color
        ctx.strokeRect(x, y, gridSize, gridSize);
    }
}


function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    for (let row = 0; row < size; row++) { // Loop through rows
        for (let col = 0; col < size; col++) { // Loop through columns
            drawCell(row, col);
            drawCellBorder(row, col);
            drawPiece(row, col);
            drawNumberCell(row, col);
            drawLabelText(row, col);
        }
    }
    drawNeonHighlight();
}

function getCell(offsetX, offsetY) {
    const row = Math.floor(offsetY / gridSize);
    const col = Math.floor(offsetX / gridSize);
    // alert(`${row}, ${col}`)
    return { row, col }
}

function isValidMove(fromRow, fromCol, toRow, toCol) {
    const diffRow = Math.abs(toRow - fromRow);
    const diffCol = Math.abs(toCol - fromCol);

    // if((diffRow >= 1 && diffRow <= 7) &&  (diffCol >= 1 && diffCol <= 7)) {
    //     return true;
    // }

    if(fromRow === toRow && fromCol === toCol) {
        selected = null;
        return false;
    }

    if(board[toRow][toCol] !== 0) {
        return false;
    }

    if(board[fromRow][fromCol] === 1) {
        const diffRow = fromRow - toRow;
        if(diffRow !== 1) {
            if((toRow + toCol) % 2 === 0) {
                return false;
            }else {
                const diffRowAbs = Math.abs(diffRow);
                const diffColAbs = Math.abs(diffCol);

                if(Math.abs(diffRow) === 1 && Math.abs(diffCol) === 1) {
                    return true;
                }

                if(diffRowAbs === 2 && diffColAbs === 2) {
                    const midRow = fromRow + diffRowAbs / 2;
                    const midCol = fromCol + diffColAbs / 2;
                    //remove
                    alert(`${midRow}, ${midCol}`);
                    // board[midRow][midCol] = 0;

                    return true;
                }
            }
        }else{
            return false;
        }
    }

    if(board[fromRow][fromCol] === 2) {
        const diffRow = fromRow - toRow;
        if(diffRow !== -1) {
            if((toRow + toCol) % 2 === 0) {
                return false;
            }else {
                const diffRowAbs = Math.abs(diffRow);
                const diffColAbs = Math.abs(diffCol);

                if(diffRowAbs === 1 && diffColAbs === 1) {
                    return true;
                }

                if(diffRowAbs === 2 && diffColAbs === 2) {
                    let midRow = fromRow - Math.abs(fromRow - toRow) / 2;
                    let midCol = null;

                    if(fromCol > toCol) {
                        midCol = fromCol - Math.abs(fromCol - toCol) / 2;
                    }
                    if(fromCol < toCol) {
                        midCol = fromCol + Math.abs(fromCol - toCol) / 2;
                    }
                    if(board[midRow][midCol] === 1) {
                        waitForRemove = { row: midRow, col: midCol }
                        return true;
                    }
                    return false;
                }

                if(diffRowAbs > 2 && diffColAbs > 2) {
                    const diffRow = Math.abs(fromRow - toRow);
                    const diffCol = Math.abs(fromCol - toCol);
                    for(var i=1; i < diffRow; i++) {
                        if(fromCol > toCol) {
                            console.log(fromRow - i + " " + (fromCol - i));
                            if(board[fromRow - i][fromCol - i] !== 0 && board[fromRow - i][fromCol - i] !== 2) {
                                console.log(`found: ${fromRow - i}, ${fromCol - i}`);
                                waitForRemove = { row: fromRow - i, col: fromCol - i }
                                return true;
                            }
                        }else{
                            console.log(fromRow - i + " " + (fromCol + i));
                            if(board[fromRow - i][fromCol + i] !== 0 && board[fromRow - i][fromCol - i] !== 2) {
                                console.log(`found: ${fromRow - i}, ${fromCol + i}`)
                                waitForRemove = { row: fromRow - i, col: fromCol + i }
                                return true;
                            }
                        }
                    }
                    return false;
                }

            }
        }else{
            return false;
        }
    }
    return false;
}

function movePiece(fromRow, fromCol, toRow, toCol) {
    board[toRow][toCol] = board[fromRow][fromCol];
    board[fromRow][fromCol] = 0;
    return;
}

function removePiece() {
    if(waitForRemove !== null) {
        board[waitForRemove.row][waitForRemove.col] = 0;
        waitForRemove = null;
    }
    return;
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
            removePiece();
            selected = null;
        }
    } else {
        if(board[row][col] === 1 || board[row][col] === 2) {
            selected = { row, col }
        } 
    }

    drawGrid();
}

drawGrid();

document.addEventListener("click", handleClick)