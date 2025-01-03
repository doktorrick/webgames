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
  [0, 2, 0, 2, 0, 0, 0, 0],
  [2, 0, 2, 0, 2, 0, 3, 0],
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

function drawBlueKing(row, col) {
  const x = col * gridSize + gridSize / 2;
  const y = row * gridSize + gridSize / 2;
  const radius = gridSize / 3; // Radius of the circle

  // Draw shadow
  ctx.beginPath();
  ctx.arc(x + 3, y + 3, radius, 0, Math.PI * 2); // Offset for shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; // Semi-transparent black
  ctx.fill();

  // Draw blue circle
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = "blue";
  ctx.fill();

  // Add border
  ctx.lineWidth = 4; // Thickness of the border
  ctx.strokeStyle = "darkblue"; // Border color
  ctx.stroke();

  // Add gradient for more depth
  const gradient = ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius);
  gradient.addColorStop(0, "lightblue"); // Highlight color
  gradient.addColorStop(1, "blue"); // Main color
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw crown
  const crownHeight = radius * 0.7; // Height of the crown
  const crownWidth = radius * 1.2; // Width of the crown
  const crownX = x - crownWidth / 2; // Top-left x of crown
  const crownY = y - crownHeight / 2; // Top of the circle to place crown

  ctx.beginPath();
  ctx.moveTo(crownX, crownY + crownHeight); // Bottom left of crown
  ctx.lineTo(crownX + crownWidth * 0.2, crownY); // First peak
  ctx.lineTo(crownX + crownWidth * 0.4, crownY + crownHeight * 0.5); // First valley
  ctx.lineTo(crownX + crownWidth * 0.6, crownY); // Second peak
  ctx.lineTo(crownX + crownWidth * 0.8, crownY + crownHeight * 0.5); // Second valley
  ctx.lineTo(crownX + crownWidth, crownY); // Third peak
  ctx.lineTo(crownX + crownWidth, crownY + crownHeight); // Bottom right of crown
  ctx.closePath();

  // Fill crown with golden gradient
  const crownGradient = ctx.createLinearGradient(
    crownX,
    crownY,
    crownX,
    crownY + crownHeight
  );
  crownGradient.addColorStop(0, "gold");
  crownGradient.addColorStop(1, "darkgoldenrod");
  ctx.fillStyle = crownGradient;
  ctx.fill();

  // Add crown border
  ctx.lineWidth = 2;
  ctx.strokeStyle = "brown";
  ctx.stroke();
}

// function drawPawn(row, col, color, isKing = false) {
//   const x = col * gridSize + gridSize / 2;
//   const y = row * gridSize + gridSize / 2;
//   const radius = gridSize / 3; // Radius of the circle

//   // Draw shadow for 3D effect
//   ctx.beginPath();
//   ctx.ellipse(x + 3, y + 3, radius * 1.1, radius * 0.9, Math.PI / 4, 0, Math.PI * 2);
//   ctx.fillStyle = "rgba(0, 0, 0, 0.3)"; // Shadow color
//   ctx.fill();

//   // Radial gradient for the main pawn body
//   const gradient = ctx.createRadialGradient(x, y - radius / 4, radius / 6, x, y, radius);
//   if (color === "white") {
//     gradient.addColorStop(0, "#f9f9f9"); // Highlight
//     gradient.addColorStop(0.4, "#e6e6e6"); // Main body
//     gradient.addColorStop(1, "#bfbfbf"); // Darker edge
//   } else {
//     gradient.addColorStop(0, "#ffaaaa"); // Highlight for red pawn
//     gradient.addColorStop(0.4, color); // Main body
//     gradient.addColorStop(1, "#880000"); // Darker edge
//   }

//   // Draw main pawn circle
//   ctx.beginPath();
//   ctx.arc(x, y, radius, 0, Math.PI * 2);
//   ctx.fillStyle = gradient; // Apply gradient
//   ctx.fill();

//   // Add border for definition
//   ctx.lineWidth = 3;
//   ctx.strokeStyle = color === "white" ? "#7a7a7a" : "#4a0000"; // Gray border for white, darker for others
//   ctx.stroke();

//   // Add a reflective highlight for the white pawn
//   if (color === "white") {
//     ctx.beginPath();
//     ctx.arc(x - radius / 3, y - radius / 3, radius / 4, 0, Math.PI * 2);
//     ctx.fillStyle = "rgba(255, 255, 255, 0.6)"; // Bright reflection
//     ctx.fill();
//   }

//   // Draw "👑" if it's a king pawn
//   if (isKing) {
//     ctx.font = `${radius}px sans-serif`;
//     ctx.fillStyle = "gold"; // Golden crown for kings
//     ctx.textAlign = "center";
//     ctx.textBaseline = "middle";
//     ctx.fillText("👑", x, y); // Position slightly above center
//   }
// }

function drawPawn(row, col, color, isKing = false) {
  const x = col * gridSize + gridSize / 2;
  const y = row * gridSize + gridSize / 2;
  const radius = gridSize / 3; // Radius of the circle

  // Draw shadow
  ctx.beginPath();
  ctx.ellipse(x + 3, y + 3, radius * 1.1, radius * 0.9, Math.PI / 4, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; // Subtle shadow
  ctx.fill();

  let gradient = null;
  let stokeLine = null;
  
  if(color === "black") {
    gradient = ctx.createRadialGradient(x, y - radius / 4, radius / 6, x, y, radius);
    gradient.addColorStop(0, "rgba(50, 50, 50, 0.8)"); 
    gradient.addColorStop(0.5, "rgba(30, 30, 30, 0.6)"); 
    gradient.addColorStop(1, "rgba(10, 10, 10, 0.4)");
    stokeLine = "rgba(9, 7, 7, 0.3)";

  }else{
    gradient = ctx.createRadialGradient(x, y - radius / 4, radius / 6, x, y, radius);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)"); 
    gradient.addColorStop(0.5, "rgba(200, 200, 255, 0.4)"); 
    gradient.addColorStop(1, "rgba(150, 150, 200, 0.2)"); 
    stokeLine = "rgba(214, 205, 205, 0.3)";
  }


  // Draw main glass pawn circle
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient; // Apply the glass-like gradient
  ctx.fill();

  // Add an outer glow effect for the glass
  ctx.lineWidth = 2;
  ctx.strokeStyle = stokeLine; // Soft white glow
  ctx.stroke();

  // Add inner reflections
  ctx.beginPath();
  ctx.arc(x - radius / 4, y - radius / 4, radius / 3, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)"; // Inner highlight
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x + radius / 5, y + radius / 5, radius / 5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)"; // Second reflection
  ctx.fill();

  // Draw "👑" for king pawn
  if (isKing) {
    ctx.font = `${radius}px sans-serif`;
    ctx.fillStyle = "gold"; // Golden crown
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("👑", x, y); // Position slightly above center
  }
}

function drawBlueBack(row, col) {
  const x = col * gridSize + gridSize / 2;
  const y = row * gridSize + gridSize / 2;
  const radius = gridSize / 3; // Radius of the circle

  // Draw shadow
  ctx.beginPath();
  ctx.arc(x + 3, y + 3, radius, 0, Math.PI * 2); // Offset for shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; // Semi-transparent black
  ctx.fill();

  // Draw blue circle
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = "blue";
  ctx.fill();

  // Add border
  ctx.lineWidth = 4; // Thickness of the border
  ctx.strokeStyle = "darkblue"; // Border color
  ctx.stroke();

  // Add gradient for more depth
  const gradient = ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius);
  gradient.addColorStop(0, "lightblue"); // Highlight color
  gradient.addColorStop(1, "blue"); // Main color
  ctx.fillStyle = gradient;
  ctx.fill();
}

// function drawBlueBack(row, col) {
//   const x = col * gridSize + gridSize / 2;
//   const y = row * gridSize + gridSize / 2;
//   const outerRadius = gridSize / 3; // Outer circle radius
//   const innerRadius = gridSize / 3; // Inner circle radius

//   // Draw shadow
//   ctx.beginPath();
//   ctx.arc(x + 5, y + 5, outerRadius, 0, Math.PI * 2); // Offset for shadow
//   ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
//   ctx.fill();

//   // Draw outer circle with gradient
//   const outerGradient = ctx.createRadialGradient(x, y, outerRadius * 0.1, x, y, outerRadius);
//   outerGradient.addColorStop(0, "#d1d1d1"); // Light gray
//   outerGradient.addColorStop(1, "#6e6e6e"); // Dark gray

//   ctx.beginPath();
//   ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
//   ctx.fillStyle = outerGradient;
//   ctx.fill();

//   // Draw inner circle with gradient
//   const innerGradient = ctx.createRadialGradient(x, y, innerRadius * 0.1, x, y, innerRadius);
//   innerGradient.addColorStop(0, "#ffffff"); // White (highlight)
//   innerGradient.addColorStop(1, "#a1a1a1"); // Medium gray

//   ctx.beginPath();
//   ctx.arc(x, y, innerRadius, 0, Math.PI * 2);
//   ctx.fillStyle = innerGradient;
//   ctx.fill();

//   // Add border (optional)
//   ctx.lineWidth = 2;
//   ctx.strokeStyle = "#4d4d4d"; // Darker gray for the border
//   ctx.stroke();
// }

function drawPieceFrontk(row, col, color) {
  ctx.beginPath();
  ctx.arc(
    col * gridSize + gridSize / 2,
    row * gridSize + gridSize / 2,
    gridSize / 3,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = color;
  ctx.fill();
}

function drawPieceBack(row, col, color) {
  ctx.beginPath();
  ctx.arc(
    col * gridSize + gridSize / 2,
    row * gridSize + gridSize / 2,
    gridSize / 3, // Radius
    0,
    Math.PI * 2
  );
  ctx.fillStyle = color;
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

function drawPiece(row, col) {
  const x = col * gridSize + gridSize / 2;
  const y = row * gridSize + gridSize / 2;
  const pieceSize = gridSize * 0.9;

  switch (board[row][col]) {
    case 1:
      // drawRedBack(y, x, pieceSize);
      drawPawn(row, col, "black");
      break;
    case 2:
      // drawWhiteBack(y, x, pieceSize);
      // drawBlueBack(row, col);
      drawPawn(row, col, "white");
      break;
    case 3:
      // ctx.drawImage(
      //   imgBlack2,
      //   x - pieceSize / 2,
      //   y - pieceSize / 2,
      //   pieceSize,
      //   pieceSize
      // );
      drawPawn(row, col, "black", true);

      break;
    case 4:
      // ctx.drawImage(
      //   imgWhite2,
      //   x - pieceSize / 2,
      //   y - pieceSize / 2,
      //   pieceSize,
      //   pieceSize
      // );
      drawPawn(row, col, "white", true);

      break;
    default:
      break;
  }
}

function drawCoord(row, col) {
  const text = `(${row}, ${col})`;
  const textWidth = ctx.measureText(text).width;
  const textX = col * gridSize + gridSize / 2;
  const textY = row * gridSize + gridSize / 2;
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

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      drawCell(row, col);
      drawCellBorder(row, col);
      drawPiece(row, col);
      drawNumberCell(row, col);
      drawCoord(row, col);
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

function findMidRowDynamic(fromRow, toRow) {
  if (fromRow < toRow) {
    const result = fromRow + Math.abs(fromRow - toRow) / 2;
    return result;
  }
  if (fromRow > toRow) {
    const result = Math.abs(fromRow - Math.abs(fromRow - toRow) / 2);
    return result;
  }
}

function findMidColDynamic(fromCol, toCol) {
  if (fromCol < toCol) {
    const result = Math.abs(fromCol + Math.abs(fromCol - toCol) / 2);
    return result;
  }
  if (fromCol > toCol) {
    const result = Math.abs(fromCol - Math.abs(fromCol - toCol) / 2);
    return result;
  }
}

function findCaptureRowDynamic(fromRow, toRow) {
  if (fromRow < toRow) {
    const result = fromRow + Math.abs(fromRow - toRow) / 2;
    return result;
  }
  if (fromRow > toRow) {
    const result = Math.abs(fromRow - Math.abs(fromRow - toRow) / 2);
    return result;
  }
}

function findCaptureColDynamic(fromCol, toCol) {
  if (fromCol < toCol) {
    const result = toCol - 1;
    return result;
  }
  if (fromCol > toCol) {
    const result = toCol + 1;
    return result;
  }
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
        if(board[targetRow][targetCol] === 0 && board[toRow][toCol] === 0) {
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
