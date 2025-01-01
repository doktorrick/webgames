const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 600;

const size = 8;
const gridSize = canvas.width / 8;
const canvasHeight = canvas.height;
const canvasWidth = canvas.width;
let selected = null;
let waitForRemove = null;

const imgWhite = new Image();
const imgBlack = new Image();
const imgWhite2 = new Image();
const imgBlack2 = new Image();

imgWhite.src = "wb.png";
imgBlack.src = "bb.png";

imgWhite2.src = "wh.png";
imgBlack2.src = "bh.png";
//2-, 1+

let board = [
  [0, 1, 0, 1, 0, 1, 0, 4],
  [1, 0, 1, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 2, 0, 2, 0, 2, 0, 2],
  [2, 0, 2, 0, 2, 0, 2, 0],
];

function drawWhiteBack(row, col, pieceSize) {
  ctx.drawImage(
    imgWhite,
    col - pieceSize / 2,
    row - pieceSize / 2,
    pieceSize,
    pieceSize
  );
}
function drawRedBack(row, col, pieceSize) {
  ctx.drawImage(
    imgBlack,
    col - pieceSize / 2,
    row - pieceSize / 2,
    pieceSize,
    pieceSize
  );
}

function drawBlueBack(row, col) {
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
}

function drawGreenBack(row, col) {
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

function isKing(row, col) {
  return true;
}

function drawPiece(row, col) {
  const x = col * gridSize + gridSize / 2;
  const y = row * gridSize + gridSize / 2;
  const pieceSize = gridSize * 0.9;
  if (board[row][col] === 1) {
    drawRedBack(y, x, pieceSize);
  } else if (board[row][col] === 2) {
    drawWhiteBack(y, x, pieceSize);
  } else if (board[row][col] === 3) {
    drawWhiteBack(y, x, pieceSize);
    ctx.drawImage(
      imgBlack2,
      x - pieceSize / 2,
      y - pieceSize / 2,
      pieceSize,
      pieceSize
    );
  } else if (board[row][col] === 4) {
    drawWhiteBack(y, x, pieceSize);
    ctx.drawImage(
      imgWhite2,
      x - pieceSize / 2,
      y - pieceSize / 2,
      pieceSize,
      pieceSize
    );
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
  const text =
    (row + col) % 2 === 0 ? "" : 4 * row + Math.ceil((row + col) / 2);
  const textX = col * gridSize + 2;
  const textY = row * gridSize + gridSize / 1.1;
  ctx.font = "12px Arial";
  ctx.fillStyle = "black";
  ctx.fillText(text, textX, textY);
}

function drawCell(row, col) {
  ctx.fillStyle = (row + col) % 2 === 0 ? "white" : "red";
  ctx.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
}

function drawCellBorder(row, col) {
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1;
  ctx.strokeRect(col * gridSize, row * gridSize, gridSize, gridSize);
}

function drawHighlight() {
  if (selected) {
    if (selected.col < 0 || selected.col > 7) return;
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 4;
    ctx.strokeRect(
      selected.col * gridSize,
      selected.row * gridSize,
      gridSize,
      gridSize
    );
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
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
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
  return { row, col };
}

function gameRules(fromRow, fromCol, toRow, toCol) {
    const diffRow = Math.abs(toRow - fromRow);
    const diffCol = Math.abs(toCol - fromCol);

  //select the same piece
  if (fromRow === toRow && fromCol === toCol) {
    selected = null;
    return false;
  }

  //prevent move the event cell
  if ((toRow + toCol) % 2 === 0) {
    return false;
  }

  //normal pieces can't move left or right backwakd
  if(board[fromRow][fromCol] === 1 || board[fromRow][fromCol] === 2) {
    if(board[fromRow][fromCol] === 1 && fromRow > toRow) {
        return false;
    }
    if(board[fromRow][fromCol] === 2 && fromRow < toRow) {
        return false;
    }
    if (diffRow === 1 && board[toRow][toCol] === 0) {
        return true;
    }
  }

  //prevent move straightforward or backward
  if (fromCol === toCol) {
    return false;
  }

  //prevent move the occupied spot
  if (board[toRow][toCol] !== 0) {
    return false;
  }

  return true;
}

function displayStatus(fromRow, toRow) {
    const diffRow = fromRow - toRow;
    const elementP = document.createElement("p");
    elementP.innerHTML = diffRow;
    const info = document.getElementById("info");
    info.innerText = null;
    info.appendChild(elementP);
}

function hasConsecutiveNumbers(arr, num) {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === num && arr[i + 1] === num) {
      return true;
    }
  }
  return false;
}

function hasRepeats(arr, num) {
  let count = 0;
  for (const val of arr) {
    if (val === num) {
      count++;
      if (count > 1) {
        return true;
      }
    }
  }
  return false;
}

function isValidMove(fromRow, fromCol, toRow, toCol) {
  const diffRow = Math.abs(toRow - fromRow);
  const diffCol = Math.abs(toCol - fromCol);
  const isInRules = gameRules(fromRow, fromCol, toRow, toCol);

  if (!isInRules) return false;

  if (board[fromRow][fromCol] === 1 || board[fromRow][fromCol] === 2) {
    displayStatus(fromRow, toRow)
    if (diffRow === 2 && diffCol === 2) {
      let midRow = null;
      let midCol = null;

      if(fromRow > toRow) {
        midRow = fromRow - Math.abs(fromRow - toRow) / 2;
      } 

      if(fromRow < toRow) {
        midRow = fromRow - Math.abs(fromRow + toRow) / 2;
      }

      if (fromCol > toCol) {
        midCol = fromCol - Math.abs(fromCol - toCol) / 2;
      }

      if (fromCol < toCol) {
        midCol = fromCol + Math.abs(fromCol - toCol) / 2;
      }

      if (board[midRow][midCol] !== board[fromRow][fromCol]) {
        waitForRemove = { row: midRow, col: midCol };
        console.log(waitForRemove)
        return true;
      }
      return false;
    }
  }

  if (board[fromRow][fromCol] === 4) {
    const targetRow = fromRow > toRow ? toRow + 1 : toRow - 1;
    const targetCol = fromCol > toCol ? toCol + 1 : toCol - 1;

    const info = document.getElementById("info");
    const diffRow = Math.abs(fromRow - toRow);
    const diffCol = Math.abs(fromCol - toCol);

    if (diffRow > 0) {
      const elementP = document.createElement("p");
      const mod2 = (toRow + toCol) % 2;
      elementP.textContent = `(${targetRow},${targetCol}) - mod ${mod2}`;
      info.appendChild(elementP);

      let checkValid = true;
      let checkRow = [];

      //left-top scan (-, -)
      if (fromCol > toCol && fromRow > toRow) {
        console.log("left top");
        for (let index = 1; index < diffCol + 1; index++) {
          const row = fromRow - index;
          const col = fromCol - index;
          const boardLoop = board[row][col];
          checkRow.push(board[row][col]);
          if (boardLoop !== 0) {
            console.log(`valid false`);
            checkValid = false;
          }
        }
      }

      //right-top scan (-, +)
      if (fromCol < toCol && fromRow > toRow) {
        console.log(`right-top`);
        for (let index = 1; index < diffCol + 1; index++) {
          const row = fromRow - index;
          const col = fromCol + index;
          const boardLoop = board[row][col];
          checkRow.push(board[row][col]);
          if (boardLoop !== 0) {
            console.log(`valid false`);
            checkValid = false;
          }
        }
      }

      //right-bottom scan (+, +)
      if (fromCol < toCol && fromRow < toRow) {
        console.log(`right-bottom`);
        for (let index = 1; index < diffCol + 1; index++) {
          const row = fromRow + index;
          const col = fromCol + index;
          const boardLoop = board[row][col];
          checkRow.push(board[row][col]);
          if (boardLoop !== 0) {
            console.log(`valid false`);
            checkValid = false;
          }
        }
      }

      //left-bottom scan (+, -)
      if (fromCol > toCol && fromRow < toRow) {
        console.log(`left-bottom`);
        for (let index = 1; index < diffCol + 1; index++) {
          const row = fromRow + index;
          const col = fromCol - index;
          const boardLoop = board[row][col];
          checkRow.push(board[row][col]);
          if (boardLoop !== 0) {
            console.log(`valid false`);
            checkValid = false;
          }
        }
      }

      const hasConsec = hasConsecutiveNumbers(checkRow, 1);
      const hasRepeatsNumbers = hasRepeats(checkRow, 1);

      if (hasConsec || hasRepeatsNumbers) {
        selected = null;
        return false;
      }

      if (
        board[targetRow][targetCol] === 1 ||
        board[targetRow][targetCol] === 3
      ) {
        console.log(`diffRow: ${diffRow}`);
        waitForRemove = { row: targetRow, col: targetCol };
        return true;
      }

      return checkValid;
    }
  }

  return true;

}

function movePiece(fromRow, fromCol, toRow, toCol) {
  board[toRow][toCol] = board[fromRow][fromCol];
  if (board[toRow][toCol] === 1 && toRow === 7) {
    board[toRow][toCol] = 3;
  }
  if (board[toRow][toCol] === 2 && toRow === 0) {
    board[toRow][toCol] = 4;
  }
  board[fromRow][fromCol] = 0;
  return;
}

function removePiece() {
  if (waitForRemove !== null) {
    board[waitForRemove.row][waitForRemove.col] = 0;
    waitForRemove = null;
  }
  return;
}

function handleClick(event) {
  const rect = canvas.getBoundingClientRect();
  const offsetX = event.clientX - rect.left;
  const offsetY = event.clientY - rect.top;

  if (
    !(offsetX >= 0 && offsetX <= canvas.width) &&
    !(offsetY >= 0 && offsetY <= canvas.height)
  )
    return;

  const { row, col } = getCell(offsetX, offsetY);

  if (selected) {
    const isValid = isValidMove(selected.row, selected.col, row, col);
    if (isValid) {
      movePiece(selected.row, selected.col, row, col);
      removePiece();
      selected = null;
    }
  } else {
    if (
      board[row][col] === 1 ||
      board[row][col] === 2 ||
      board[row][col] === 3 ||
      board[row][col] === 4
    ) {
      selected = { row, col };
    }
  }
}

function playGame() {
  drawGrid();
  requestAnimationFrame(playGame);
}

document.addEventListener("click", handleClick);

playGame();
