const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 600;

const size = 8;
const gridSize = canvas.width / 8;
const canvasHeight = canvas.height;
const canvasWidth = canvas.width;
let selected = null;
let lastPosition = null;

let waitForRemove = null;

let playerTurn = 1;
const info = document.getElementById("info");
info.textContent = `Player: ${playerTurn} 's turn (${playerTurn? "black": "white"})`;

let board = [
  [0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 2, 0, 2, 0, 2, 0, 2],
  [2, 0, 2, 0, 2, 0, 2, 0],
];

function changePlayerTurn() {
  switch (playerTurn) {
    case 1:
      playerTurn = 2;
      info.textContent = `Player: ${playerTurn} 's turn (${playerTurn? "black": "white"})`;
      break;
    case 2:
      playerTurn = 1;
      info.textContent = `Player: ${playerTurn} 's turn (${playerTurn? "black": "white"})`;
      break;
    default:
      break;
  }
}

function drawCustomPawn(row, col, color, isKing = false) {
  const x = col * gridSize + gridSize / 2;
  const y = row * gridSize + gridSize / 2;
  const radius = gridSize / 3; // Radius of the circle

  // Draw shadow for 3D effect
  ctx.beginPath();
  ctx.ellipse(
    x + 3,
    y + 3,
    radius * 1.1,
    radius * 0.9,
    Math.PI / 4,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)"; // Shadow color
  ctx.fill();

  // Radial gradient for the main pawn body
  const gradient = ctx.createRadialGradient(
    x,
    y - radius / 4,
    radius / 6,
    x,
    y,
    radius
  );
  if (color === "white") {
    gradient.addColorStop(0, "#f9f9f9"); // Highlight
    gradient.addColorStop(0.4, "#e6e6e6"); // Main body
    gradient.addColorStop(1, "#bfbfbf"); // Darker edge
  } else {
    gradient.addColorStop(0, "#ffaaaa"); // Highlight for red pawn
    gradient.addColorStop(0.4, color); // Main body
    gradient.addColorStop(1, "#880000"); // Darker edge
  }

  // Draw main pawn circle
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient; // Apply gradient
  ctx.fill();

  // Add border for definition
  ctx.lineWidth = 3;
  ctx.strokeStyle = color === "white" ? "#7a7a7a" : "#4a0000"; // Gray border for white, darker for others
  ctx.stroke();

  // Add a reflective highlight for the white pawn
  if (color === "white") {
    ctx.beginPath();
    ctx.arc(x - radius / 3, y - radius / 3, radius / 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)"; // Bright reflection
    ctx.fill();
  }

  // Draw "👑" if it's a king pawn
  if (isKing) {
    ctx.font = `${radius}px sans-serif`;
    ctx.fillStyle = "gold"; // Golden crown for kings
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("👑", x, y); // Position slightly above center
  }
}

function drawPiece(row, col) {
  const x = col * gridSize + gridSize / 2;
  const y = row * gridSize + gridSize / 2;
  const pieceSize = gridSize * 0.9;

  switch (board[row][col]) {
    case 1:
      drawCustomPawn(row, col, "black");
      break;
    case 2:
      drawCustomPawn(row, col, "white");
      break;
    case 3:
      drawCustomPawn(row, col, "black", true);
      break;
    case 4:
      drawCustomPawn(row, col, "white", true);
      break;
    default:
      break;
  }
}

function drawCoord(row, col) {
  const text = `(${row},${col})`;
  const textWidth = ctx.measureText(text).width;
  const textHeight = 12; 
  const textX = col * gridSize + (gridSize - textWidth) / 2;
  const textY = row * gridSize + (gridSize + textHeight) / 2;
  ctx.font = "12px Arial";
  ctx.fillStyle = "black";
  ctx.fillText(text, textX, textY);
}

function drawNumberCell(row, col) {
  const text =
    (row + col) % 2 === 0 ? "" : 4 * row + Math.ceil((row + col) / 2);
  const textX = col * gridSize + 10;
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

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      drawCell(row, col);
      drawCellBorder(row, col);
      drawPiece(row, col);
      drawNumberCell(row, col);
      // drawCoord(row, col);
    }
  }
  drawHighlight();
}

function getCell(offsetX, offsetY) {
  const row = Math.floor(offsetY / gridSize);
  const col = Math.floor(offsetX / gridSize);
  return { row, col };
}

function gameRules(fromRow, fromCol, toRow, toCol) {
  //check waitForRemove
  if (waitForRemove) {
    return false;
  }

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
  if (board[fromRow][fromCol] === 1 || board[fromRow][fromCol] === 2) {
    if (board[fromRow][fromCol] === 1 && fromRow > toRow) {
      return false;
    }
    if (board[fromRow][fromCol] === 2 && fromRow < toRow) {
      return false;
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

  //check player turn with final pawn state
  if (playerTurn !== board[fromRow][fromCol]) {
    if (playerTurn === 1 && board[fromRow][fromCol] !== playerTurn + 2) {
      alert("Player 1 's turn");
      selected = null;
      return false;
    }
    if (playerTurn === 2 && board[fromRow][fromCol] !== playerTurn + 2) {
      alert("Player 2 's turn");
      selected = null;
      return false;
    }
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

function isValidMove(fromRow, fromCol, toRow, toCol) {
  const diffRow = Math.abs(toRow - fromRow);
  const dPieceMove = diffRow;

  const isInRules = gameRules(fromRow, fromCol, toRow, toCol);
  if (!isInRules) return false;

  if (board[fromRow][fromCol] === 1 || board[fromRow][fromCol] === 2) {
    switch (dPieceMove) {
      case 1:
        if (board[toRow][toCol] === 0) {
          return true;
        }
        break;
      case 2:
        const midRowDynamic = findMidRowDynamic(fromRow, toRow);
        const midColDynamic = findMidColDynamic(fromCol, toCol);

        if (
          board[midRowDynamic][midColDynamic] !== board[fromRow][fromCol] &&
          board[midRowDynamic][midColDynamic] !== 0 &&
          board[midRowDynamic][midColDynamic] !== board[fromRow][fromCol] + 2
        ) {
          waitForRemove = { row: midRowDynamic, col: midColDynamic };
          return true;
        }
        return false;
      default:
        return false;
    }
  }

  //King state
  if (board[fromRow][fromCol] === 3 || board[fromRow][fromCol] === 4) {
    const targetRow = fromRow > toRow ? toRow + 1 : toRow - 1;
    const targetCol = fromCol > toCol ? toCol + 1 : toCol - 1;
    const diffRow = Math.abs(fromRow - toRow);
    const diffCol = Math.abs(fromCol - toCol);

    switch (dPieceMove) {
      case 1:
        if (board[toRow][toCol] === 0) {
          return true;
        }
        break;
      case 2:
        if (
          board[targetRow][targetCol] !== board[fromRow][fromCol] &&
          board[targetRow][targetCol] !== 0 &&
          board[targetRow][targetCol] !== board[fromRow][fromCol] - 2 &&
          board[toRow][toCol] === 0
        ) {
          waitForRemove = { row: targetRow, col: targetCol };
          return true;
        }
        if (board[targetRow][targetCol] === 0 && board[toRow][toCol] === 0) {
          return true;
        }
        return false;

      default:
        if (dPieceMove > 2) {
          let rows = [];

          //left-top scan (-, -)
          if (fromCol > toCol && fromRow > toRow) {
            console.log("left top");
            for (let index = 1; index < diffCol + 1; index++) {
              const row = fromRow - index;
              const col = fromCol - index;
              rows.push(board[row][col]);
            }
          }

          //right-top scan (-, +)
          if (fromCol < toCol && fromRow > toRow) {
            console.log(`right-top`);
            for (let index = 1; index < diffCol + 1; index++) {
              const row = fromRow - index;
              const col = fromCol + index;
              rows.push(board[row][col]);
            }
          }

          //right-bottom scan (+, +)
          if (fromCol < toCol && fromRow < toRow) {
            console.log(`right-bottom`);
            for (let index = 1; index < diffCol + 1; index++) {
              const row = fromRow + index;
              const col = fromCol + index;
              rows.push(board[row][col]);
            }
          }

          //left-bottom scan (+, -)
          if (fromCol > toCol && fromRow < toRow) {
            console.log(`left-bottom`);
            for (let index = 1; index < diffCol + 1; index++) {
              const row = fromRow + index;
              const col = fromCol - index;
              rows.push(board[row][col]);
            }
          }

          let numCounts = {};
          for (let index = 0; index < rows.length; index++) {
            const element = rows[index];
            if (numCounts[rows[index]]) {
              numCounts[rows[index]] += 1;
            } else {
              numCounts = { ...numCounts, [element]: 1 };
            }
          }

          // numObj[5] += 1;
          console.log(numCounts);
          console.log(Object.keys(numCounts).length);

          if (Object.keys(numCounts).length === 1) {
            numCounts = {};
            return true;
          }

          if (Object.keys(numCounts).length === 2) {
            if (board[toRow][toCol] === 0 && rows[rows.length - 2] !== 0) {
              if (
                numCounts[1] > 1 ||
                numCounts[2] > 1 ||
                numCounts[3] > 1 ||
                numCounts[4] > 1
              ) {
                selected = null;
                numCounts = {};
                return false;
              }
              if (
                rows[rows.length - 2] !== board[fromRow][fromCol] &&
                rows[rows.length - 2] !== board[fromRow][fromCol] &&
                rows[rows.length - 2] !== board[fromRow][fromCol] - 2
              ) {
                const captureRow = findCaptureColDynamic(fromRow, toRow);
                const captureCol = findCaptureColDynamic(fromCol, toCol);
                waitForRemove = { row: captureRow, col: captureCol };
                numCounts = {};
                return true;
              }
              selected = null;
              numCounts = {};
              return false;
            }
            selected = null;
            numCounts = {};
            return false;
          }

          selected = null;
          numCounts = {};
          return false;
        }
        break;
    }
  }

  return false;
}

function movePiece(fromRow, fromCol, toRow, toCol) {
  board[toRow][toCol] = board[fromRow][fromCol];
  //promote king
  if (board[toRow][toCol] === 1 && toRow === 7) {
    board[toRow][toCol] = 3;
  }
  //promote king
  if (board[toRow][toCol] === 2 && toRow === 0) {
    board[toRow][toCol] = 4;
  }
  //reset the first select position
  board[fromRow][fromCol] = 0;
  //set last position
  lastPosition = {row: toRow, col: toCol}

  return;
}

function removePiece() {
  if (waitForRemove !== null) {
    board[waitForRemove.row][waitForRemove.col] = 0;
    waitForRemove = null;
  }
  return;
}

function isPawnCapturePossible() {
  if(lastPosition !== null) {
    let limit = lastPosition.row? Math.abs(lastPosition.row - 7) + 1: 0;
    console.log(`limit is: ${limit}`)
    //scan 4 directions
    for (let index = 1; index < limit; index++) {
      // console.log(index)
      const position = board[lastPosition.row + index][lastPosition.col - index];
      console.log(`${lastPosition.row + index} ${lastPosition.col - index} --> ${position}`);
      // if( lastPosition.row - index === -1) break;
    }

    return false;
  }
  return false;
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

      // const possible = isPawnCapturePossible();
      // if(!possible) return;
  
      changePlayerTurn();
      selected = null;
      return;
      
    }
  } else {
    if (
      board[row][col] === 1 ||
      board[row][col] === 2 ||
      board[row][col] === 3 ||
      board[row][col] === 4
    ) {
      selected = { row, col };
      return;
    }
  }
}

// Game Initial Setup
// ------------------------------------------
// One time setup activities for event handlers
// and setting initial global values.
function playGame() {
  drawBoard();
  requestAnimationFrame(playGame);
}

document.addEventListener("click", handleClick);

playGame();
