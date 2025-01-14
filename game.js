const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 600;
let needsRender = true;

const size = 8;
const gridSize = canvas.width / 8;
const canvasHeight = canvas.height;
const canvasWidth = canvas.width;
let selected = null;
let preSelected = null;
let lastPosition = null;
let waitForRemove = null;
let combo = 0;
let readyCombo = false;
let removeMark = 0;
let clickCountSelected = 0;
let playerTurn = 1;
const info = document.getElementById("info");
info.textContent = `Player: ${playerTurn} 's turn (${
  playerTurn === 1 ? "black" : "white"
})`;

let board = [
  [0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 3, 0, 0, 0],
  [0, 0, 0, 4, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 2, 0, 2, 0, 2, 0, 2],
  [2, 0, 2, 0, 2, 0, 2, 0],
];

function changePlayerTurn() {
  switch (playerTurn) {
    case 1:
      playerTurn = 2;
      info.textContent = `Player: ${playerTurn} 's turn (${
        playerTurn === 1 ? "black" : "white"
      })`;
      break;
    case 2:
      playerTurn = 1;
      info.textContent = `Player: ${playerTurn} 's turn (${
        playerTurn === 1 ? "black" : "white"
      })`;
      break;
    default:
      break;
  }
}

function drawCustomPawn(
  row,
  col,
  color,
  isKing = false,
  proBlack = false,
  proKing = false
) {
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
  ctx.strokeStyle = color === "white" ? "rgba(200, 200, 200, 0.3)" : "#4a0000"; // Gray border for white, darker for others
  ctx.stroke();

  // Add a reflective highlight for the white pawn
  if (color === "white" || color === "black") {
    ctx.beginPath();
    ctx.arc(x - radius / 3, y - radius / 3, radius / 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)"; // Bright reflection
    ctx.fill();
  }

  if (proBlack) {
    const x = col * gridSize + gridSize / 2;
    const y = row * gridSize + gridSize / 2;
    const radius = gridSize / 3; // Radius of the circle

    ctx.save();
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
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; // Subtle shadow
    ctx.fill();

    // Create the main pawn body
    const gradient = ctx.createRadialGradient(
      x,
      y - radius / 4,
      radius / 6,
      x,
      y,
      radius
    );
    gradient.addColorStop(
      0,
      color === "white" ? "rgba(255, 255, 255, 0.8)" : "rgba(50, 50, 50, 0.8)"
    );
    gradient.addColorStop(
      0.5,
      color === "white" ? "rgba(200, 200, 255, 0.4)" : "rgba(30, 30, 30, 0.6)"
    );
    gradient.addColorStop(
      1,
      color === "white" ? "rgba(150, 150, 200, 0.2)" : "rgba(10, 10, 10, 0.4)"
    );

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient; // Apply the gradient
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle =
      color === "white" ? "rgba(255, 255, 255, 0.5)" : "rgba(50, 50, 50, 0.5)";
    ctx.stroke();
  }

  if (proKing) {
    ctx.save();
    let auraColors;
    if (color === "white") {
      // White pawn aura (light gold and blue)
      auraColors = [
        "rgba(255, 215, 0, 0.6)",
        "rgba(255, 204, 0, 0.4)",
        "rgba(255, 255, 0, 0.2)",
      ];
    } else {
      // Black pawn aura (purple-black villain aura)
      auraColors = [
        "rgba(128, 0, 128, 0.6)", // Dark purple
        "rgba(75, 0, 130, 0.4)", // Indigo purple
        "rgba(50, 0, 80, 0.2)", // Dark purple
      ];
    }

    // Apply fire-like or halo frame with jagged edges or blur
    for (let i = 1; i <= 3; i++) {
      // Create random jitter offset to give flame-like effect
      const jitterX = Math.random() * 4 - 2; // Random horizontal offset between -2 and 2
      const jitterY = Math.random() * 4 - 2; // Random vertical offset between -2 and 2

      ctx.beginPath();
      ctx.arc(x + jitterX, y + jitterY, radius + i * 5, 0, Math.PI * 2); // Apply jitter to the circle center
      ctx.strokeStyle = auraColors[i - 1]; // Layered aura colors
      ctx.lineWidth = 6; // Thicker lines for a fire effect
      ctx.lineJoin = "round"; // Rounded corners for a smoother flame-like effect
      ctx.stroke();
    }
  }

  // Draw "👑" if it's a king pawn
  if (isKing && !proKing) {
    ctx.save(); // Save the current canvas state
    ctx.font = `${radius}px sans-serif`; // Set the font for the crown
    ctx.fillStyle = "gold"; // Golden crown for kings
    ctx.textAlign = "center";
    ctx.textBaseline = "middle"; // Align text vertically to the middle
    ctx.fillText("👑", x, y); // Draw the crown emoji
    ctx.restore(); // Restore the canvas state to avoid affecting other drawings
  }
}

function drawPiece(row, col) {
  const x = col * gridSize + gridSize / 2;
  const y = row * gridSize + gridSize / 2;
  const pieceSize = gridSize * 0.9;

  switch (board[row][col]) {
    case 1:
      drawCustomPawn(row, col, "black", null, true, null);
      break;
    case 2:
      drawCustomPawn(row, col, "white");
      break;
    case 3:
      drawCustomPawn(row, col, "black", true, null, true);
      // drawPawn(row, col, "black", true);

      break;
    case 4:
      drawCustomPawn(row, col, "white", true, false, true);
      // drawPawn(row, col, "white", true);

      break;
    default:
      break;
  }
}

function drawCoord(row, col) {
  ctx.beginPath();
  const text = `(${row},${col})`;
  const textX = col * gridSize + gridSize / 2;
  const textY = row * gridSize + gridSize / 2;
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
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
    ctx.lineWidth = 6;

    const offset = ctx.lineWidth / 2;
    ctx.strokeRect(
      selected.col * gridSize + offset,
      selected.row * gridSize + offset,
      gridSize - ctx.lineWidth,
      gridSize - ctx.lineWidth
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
      drawCoord(row, col);
      drawHighlight();
    }
  }
}

function getCell(offsetX, offsetY) {
  const row = Math.floor(offsetY / gridSize);
  const col = Math.floor(offsetX / gridSize);
  return { row, col };
}

function gameRules(info) {
  const { fromRow, fromCol, toRow, toCol } = info;
  //select the same piece
  if (fromRow === toRow && fromCol === toCol) {
    console.log(">>>same piece");
    selected = null;
    clickCountSelected -= 1;
    return false;
  }

  //select the same team
  if (board[fromRow][fromCol] === board[toRow][toCol]) {
    console.log(">>>same team");
    selected = null;
    clickCountSelected -= 1;
    return false;
  }

  //check waitForRemove
  if (waitForRemove) {
    console.log(">>>waitForRemove");
    return false;
  }

  //prevent move the event cell
  if ((toRow + toCol) % 2 === 0) {
    console.log(">>>can't move to event spot");
    return false;
  }

  console.log(`PlayerTurn is ${playerTurn}`);

  //player turn
  if (playerTurn === 1) {
    let mergeResults = [];
    const blackKing = scanBlackKing();
    const blackPawns = scanBlackPawn();
    console.log(`blackPawns: ${blackPawns}`);
    console.log(`blackKing: ${JSON.stringify(blackKing)}`);

    mergeResults = [...blackKing, ...blackPawns];
    console.log(`scanmerge black: ${JSON.stringify(mergeResults)}`);

    if (mergeResults?.length > 0) {
      const isValidSelect = mergeResults.some((item) => {
        // console.log(`selected...${selected.row} == ${item.from?.row} -> ${item.status} vs ${item.from?.col} -> ${fromCol}`);
        if (item?.status === "king") {
          if (
            item.from?.row === fromRow &&
            item.from?.col === fromCol &&
            item.jumpTarget?.row === toRow &&
            item.jumpTarget?.col === toCol
          ) {
            waitForRemove = { row: item?.capture.row, col: item?.capture.col };
            return true;
          }
        }
        return (
          item?.before?.row === selected?.row &&
          item?.before?.col === selected?.col &&
          item?.jumpTarget?.row === toRow &&
          item?.jumpTarget?.col === toCol
        );
      });
      if (!isValidSelect) {
        console.log(">>>wrong pick");
        selected = null;
        return false;
      }
    }
  }

  if (playerTurn === 2) {
    let mergeResults = [];
    const whiteKing = scanWhiteKing();
    const whitePawns = scanWhitePawn();
    console.log(`whitePawns: ${whitePawns}`);
    console.log(`whiteKing: ${JSON.stringify(whiteKing)}`);

    mergeResults = [...whiteKing, ...whitePawns];
    console.log(`scanmerge: ${JSON.stringify(mergeResults)}`);

    if (mergeResults?.length > 0) {
      const isValidSelect = mergeResults.some((item) => {
        // console.log(`selected...${selected.row} == ${item.from?.row} -> ${item.status} vs ${item.from?.col} -> ${fromCol}`);
        if (item?.status === "king") {
          if (
            item.from?.row === fromRow &&
            item.from?.col === fromCol &&
            item.jumpTarget.row === toRow &&
            item.jumpTarget.col === toCol
          ) {
            waitForRemove = { row: item?.capture.row, col: item?.capture.col };
            return true;
          }
        }
        return (
          item?.before?.row === selected.row &&
          item?.before?.col === selected.col &&
          item?.jumpTarget?.row === toRow &&
          item?.jumpTarget?.col === toCol
        );
      });
      if (!isValidSelect) {
        console.log(">>>wrong pick");
        selected = null;
        return false;
      }
    }
  }

  //normal pieces can't move left or right backwakd
  if (board[fromRow][fromCol] === 1 || board[fromRow][fromCol] === 2) {
    if (board[fromRow][fromCol] === 1 && fromRow > toRow) {
      console.log(">>> player 1: fromRow > toRow");
      console.log(`${fromRow}, ${toRow}`);
      return false;
    }
    if (board[fromRow][fromCol] === 2 && fromRow < toRow) {
      console.log(">>>player 2: fromRow < toRow");
      return false;
    }
  }

  //prevent move straightforward or backward
  if (fromCol === toCol) {
    console.log(">>>lock verticles");
    return false;
  }

  //prevent move the occupied spot
  if (board[toRow][toCol] !== 0) {
    console.log(">>>occupied spot");

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

  console.log("pass all rules");
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
  let info = {
    fromRow,
    fromCol,
    toRow,
    toCol,
  };
  if (!gameRules(info)) return false;
  if (
    board[fromRow][fromCol] === 1 ||
    board[fromRow][fromCol] === 2 ||
    board[fromRow][fromCol] === 3 ||
    board[fromRow][fromCol] === 4
  ) {
    if (dPieceMove === 1) {
      if (board[toRow][toCol] === 0) {
        return true;
      }
    }

    if (dPieceMove === 2) {
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
    }

    if (dPieceMove > 2 && dPieceMove < 8) {
      return true;
    }
  }
}

function movePieceAndRemove(fromRow, fromCol, toRow, toCol) {
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
  selected = { row: toRow, col: toCol };

  removePiece();
  updateBoardHightLight();

  if (selected && removeMark > 0) {
    if (board[selected.row][selected.col] == 1) {
      const blackPawn = scanBlackPawn();
      if (blackPawn.length > 0) {
        readyCombo = true;
        return;
      }
    }
    if (board[selected.row][selected.col] == 2) {
      const whiteKing = scanBlackKing();
      if (whiteKing.length > 0) {
        readyCombo = true;
        return;
      }
    }
    if (board[selected.row][selected.col] == 2) {
      const whitePawn = scanWhitePawn();
      if (whitePawn.length > 0) {
        readyCombo = true;
        return;
      }
    }
    if (board[selected.row][selected.col] == 4) {
      const whiteKing = scanWhiteKing();
      if (whiteKing.length > 0) {
        readyCombo = true;
        return;
      }
    }
  }
  readyCombo = false;
  return;
}

function removePiece() {
  if (waitForRemove !== null) {
    board[waitForRemove.row][waitForRemove.col] = 0;
    waitForRemove = null;
    removeMark += 1;
  }
  return;
}

function updateBoardHightLight() {
  if (!selected) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      drawCell(row, col);
      drawCellBorder(row, col);
      drawPiece(row, col);
      drawNumberCell(row, col);
      drawCoord(row, col);
      drawHighlight();
    }
  }
}

//#region 4 direction scan
function scanCaptureTopLeft(index, row, col, mode = "normal") {
  const rowNext = row - index - 1;
  const colNext = col - index - 1;

  const rowBefore = row - index + 1;
  const colBefore = col - index + 1;

  if (mode === "king") {
    //white king
    if (board[row][col] === 4) {
      if (row - index >= 0 && col - index >= 0) {
        if (
          board[row - index][col - index] === 1 ||
          board[row - index][col - index] === 3
        ) {
          const checkPoint = {
            row: row - index,
            col: col - index,
            status: "waiting",
            delta: Math.abs(row + index - row),
          };

          let viralPawn = board[row - index][col - index];
          let sumAll = 0;

          for (let index = 0; index < checkPoint?.delta; index++) {
            sumAll += board[checkPoint.row + index][checkPoint.col - index];
          }

          if (sumAll === viralPawn && board[rowNext]?.[colNext] === 0) {
            let captureInfo = {
              direction: "topLeft",
              from: { row, col },
              before: { row: rowBefore, col: colBefore },
              capture: { row: row - index, col: col - index },
              jumpTarget: { row: rowNext, col: colNext },
              status: "king",
              class: "whiteking",
            };
            return captureInfo;
          }
        }
      }
    }
    //black king
    if (board[row][col] === 3) {
      console.log(`black king topleft`);
      if (row - index >= 0 && col - index >= 0) {
        if (
          board[row - index][col - index] === 2 ||
          board[row - index][col - index] === 4
        ) {
          const checkPoint = {
            row: row - index,
            col: col - index,
            status: "waiting",
            delta: Math.abs(row + index - row),
          };

          let viralPawn = board[row - index][col - index];
          let sumAll = 0;

          for (let index = 0; index < checkPoint?.delta; index++) {
            sumAll += board[checkPoint.row + index][checkPoint.col - index];
          }

          if (sumAll === viralPawn && board[rowNext]?.[colNext] === 0) {
            let captureInfo = {
              direction: "topLeft",
              from: { row, col },
              before: { row: rowBefore, col: colBefore },
              capture: { row: row - index, col: col - index },
              jumpTarget: { row: rowNext, col: colNext },
              status: "king",
              class: "blackking",
            };
            return captureInfo;
          }
        }
      }
    }
  }

  if (mode === "normal") {
    if (
      board[row][col] === 2 &&
      (row - index || col - index) >= 0 &&
      (row - index || col - index) <= 7
    ) {
      if (
        board[row - index][col - index] === 1 ||
        board[row - index]?.[col - index] === 3
      ) {
        if (board[rowNext]?.[colNext] === 0) {
          if (row === rowBefore && col === colBefore) {
            return {
              direction: "topleft",
              from: { row, col },
              before: { row: rowBefore, col: colBefore },
              capture: { row: row - index, col: col - index },
              jumpTarget: { row: rowNext, col: colNext },
            };
          }
          return null;
        }
        return null;
      }
      return null;
    }
  }
}

function scanCaptureTopRight(index, row, col, mode = "normal") {
  const rowNext = row - index - 1;
  const colNext = col + index + 1;

  const rowBefore = row - index + 1;
  const colBefore = col + index - 1;

  if (mode === "king") {
    //white king
    if (board[row][col] === 4) {
      if (row - index >= 0 && col + index <= 7) {
        if (
          board[row - index][col + index] === 1 ||
          board[row - index][col + index] === 3
        ) {
          const checkPoint = {
            row: row - index,
            col: col + index,
            status: "waiting",
            delta: Math.abs(row + index - row),
          };

          let viralPawn = board[row - index][col + index];
          let sumAll = 0;

          for (let index = 0; index < checkPoint?.delta; index++) {
            sumAll += board[checkPoint.row + index][checkPoint.col - index];
          }

          if (sumAll === viralPawn && board[rowNext]?.[colNext] === 0) {
            let captureInfo = {
              direction: "topRight",
              from: { row, col },
              before: { row: rowBefore, col: colBefore },
              capture: { row: row - index, col: col + index },
              jumpTarget: { row: rowNext, col: colNext },
              status: "king",
              class: "whiteking",
            };
            return captureInfo;
          }
        }
      }
    }

    //black king
    if (board[row][col] === 3) {
      if (row - index >= 0 && col + index <= 7) {
        if (
          board[row - index][col + index] === 2 ||
          board[row - index][col + index] === 4
        ) {
          const checkPoint = {
            row: row - index,
            col: col + index,
            status: "waiting",
            delta: Math.abs(row + index - row),
          };

          let viralPawn = board[row - index][col + index];
          let sumAll = 0;

          for (let index = 0; index < checkPoint?.delta; index++) {
            sumAll += board[checkPoint.row + index][checkPoint.col - index];
          }

          if (sumAll === viralPawn && board[rowNext]?.[colNext] === 0) {
            let captureInfo = {
              direction: "topRight",
              from: { row, col },
              before: { row: rowBefore, col: colBefore },
              capture: { row: row - index, col: col + index },
              jumpTarget: { row: rowNext, col: colNext },
              status: "king",
              class: "blackking",
            };
            return captureInfo;
          }
        }
      }
    }
  }

  if (mode === "normal") {
    if (
      board[row][col] === 2 &&
      (row - index || col + index) >= 0 &&
      (row - index || col - index) <= 7
    ) {
      if (
        board[row - index][col + index] === 1 ||
        board[row - index]?.[col + index] === 3
      ) {
        if (board[rowNext]?.[colNext] === 0) {
          if (row === rowBefore && col === colBefore) {
            let captureInfo = {
              direction: "topRight",
              from: { row, col },
              before: { row: rowBefore, col: colBefore },
              capture: { row: row - index, col: col + index },
              jumpTarget: { row: rowNext, col: colNext },
            };
            return captureInfo;
          }
          return null;
        }
        return null;
      }
      return null;
    }
  }
}

function scanCaptureBottomLeft(index, row, col, mode = "normal") {
  const rowNext = row + index + 1;
  const colNext = col - index - 1;

  const rowBefore = row + index - 1;
  const colBefore = col - index + 1;

  if (mode === "king" && board[row][col] === 4) {
    //white king
    if (
      (row + index || col - index) >= 0 &&
      row + index <= 7 &&
      (row + index || col - index) <= 7
    ) {
      //detect opposite player
      if (
        board[row + index][col - index] === 1 ||
        board[row + index][col - index] === 3
      ) {
        console.log("BottomLeft...");
        console.log(`detected index: ${row + index}, ${col - index}`);
        const checkPoint = {
          row: row + index,
          col: col - index,
          status: "waiting",
          delta: Math.abs(row + index - row),
        };

        let viralPawn = board[row + index][col - index];
        let sumAll = 0;
        for (let index = 0; index < checkPoint?.delta; index++) {
          console.log(
            `${checkPoint.row - index}, ${checkPoint.col - index} ===> ${
              board[checkPoint.row - index][checkPoint.col - index]
            }`
          );
          sumAll += board[checkPoint.row - index][checkPoint.col - index];
        }
        if (sumAll === viralPawn && board[rowNext][colNext] === 0) {
          let captureInfo = {
            direction: "bottomLeft",
            from: { row, col },
            before: { row: rowBefore, col: colBefore },
            capture: { row: row + index, col: col - index },
            jumpTarget: { row: rowNext, col: colNext },
            status: "king",
            class: "whiteking",
          };
          return captureInfo;
        }
        console.log(`detected index: ${row + index}, ${col - index} not pass`);
        return null;
      }
    }
  }

  //normal
  if (mode === "normal") {
    if (
      board[row][col] === 1 &&
      (row + index || col - index) >= 0 &&
      row + index <= 7 &&
      (row + index || col - index) <= 7
    ) {
      if (
        board[row + index][col - index] === 2 ||
        board[row + index]?.[col - index] === 4
      ) {
        if (board[rowNext]?.[colNext] === 0) {
          console.log(
            `${row + index}, ${
              col - index
            } Before: ${rowBefore}, ${colBefore} capture: ${rowNext}, ${colNext}`
          );
          console.log(
            `row col check ===> ${row + index} ,${col - index} = ${
              board[row + index][col - index]
            }`
          );

          if (row === rowBefore && col === colBefore) {
            let captureInfo = {
              direction: "bottomLeft",
              from: { row, col },
              before: { row: rowBefore, col: colBefore },
              capture: { row: row + index, col: col - index },
              jumpTarget: { row: rowNext, col: colNext },
            };
            return captureInfo;
          }
          return null;
        }
        return null;
      }
      return null;
    }
  }
}

function scanCaptureBottomRight(index, row, col, mode = "normal") {
  const rowNext = row + index + 1;
  const colNext = col + index + 1;

  const rowBefore = row + index - 1;
  const colBefore = col + index - 1;

  if (mode === "king") {
    //white king
    if (board[row][col] === 4) {
      if (
        (row + index || col + index) >= 0 &&
        row + index <= 7 &&
        (row + index || col + index) <= 7
      ) {
        //detect opposite player
        if (
          board[row + index][col + index] === 1 ||
          board[row + index][col + index] === 3
        ) {
          // console.log(`detected index: ${row + index}, ${col + index}`);
          const checkPoint = {
            row: row + index,
            col: col + index,
            status: "waiting",
            delta: Math.abs(row + index - row),
          };

          let viralPawn = board[row + index][col + index];
          let sumAll = 0;
          for (let index = 0; index < checkPoint?.delta; index++) {
            console.log(
              `${checkPoint.row - index}, ${checkPoint.col - index} ===> ${
                board[checkPoint.row - index][checkPoint.col - index]
              }`
            );
            sumAll += board[checkPoint.row - index][checkPoint.col - index];
          }
          if (sumAll === viralPawn && board[rowNext][colNext] === 0) {
            let captureInfo = {
              direction: "bottomRight",
              from: { row, col },
              before: { row: rowBefore, col: colBefore },
              capture: { row: row + index, col: col + index },
              jumpTarget: { row: rowNext, col: colNext },
              status: "king",
              class: "whiteking",
            };
            return captureInfo;
          }
        }
      }
    }

    //black king
    if (board[row][col] === 3) {
      if (
        (row + index || col + index) >= 0 &&
        row + index <= 7 &&
        (row + index || col + index) <= 7
      ) {
        //detect opposite player
        if (
          board[row + index][col + index] === 2 ||
          board[row + index][col + index] === 4
        ) {
          // console.log(`detected index: ${row + index}, ${col + index}`);
          const checkPoint = {
            row: row + index,
            col: col + index,
            status: "waiting",
            delta: Math.abs(row + index - row),
          };

          let viralPawn = board[row + index][col + index];
          let sumAll = 0;
          for (let index = 0; index < checkPoint?.delta; index++) {
            console.log(
              `${checkPoint.row - index}, ${checkPoint.col - index} ===> ${
                board[checkPoint.row - index][checkPoint.col - index]
              }`
            );
            sumAll += board[checkPoint.row - index][checkPoint.col - index];
          }

          if (sumAll === viralPawn && board[rowNext][colNext] === 0) {
            let captureInfo = {
              direction: "bottomRight",
              from: { row, col },
              before: { row: rowBefore, col: colBefore },
              capture: { row: row + index, col: col + index },
              jumpTarget: { row: rowNext, col: colNext },
              status: "king",
              class: "blackking",
            };
            return captureInfo;
          }
        }
      }
    }
  }

  if (mode === "normal") {
    if (
      board[row][col] === 1 &&
      (row + index || col + index) >= 0 &&
      row + index <= 7 &&
      (row + index || col + index) <= 7
    ) {
      if (
        board[row + index][col + index] === 2 ||
        board[row + index]?.[col + index] === 4
      ) {
        if (board[rowNext]?.[colNext] === 0) {
          console.log(
            `${row + index}, ${
              col - index
            } Before: ${rowBefore}, ${colBefore} capture: ${rowNext}, ${colNext}`
          );
          console.log(
            `row col check ===> ${row + index} ,${col - index} = ${
              board[row + index][col - index]
            }`
          );
          if (row === rowBefore && col === colBefore) {
            let captureInfo = {
              direction: "bottomRight",
              from: { row, col },
              before: { row: rowBefore, col: colBefore },
              capture: { row: row + index, col: col + index },
              jumpTarget: { row: rowNext, col: colNext },
            };
            return captureInfo;
          }
          return null;
        }
        return null;
      }
      return null;
    }
  }
}
//#endregion

function scanBlackPawn() {
  if (playerTurn !== 1) return false;
  let scanResult = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] === 1 && board[row][col]) {
        for (let index = 0; index < 8; index++) {
          const bottomLeft = scanCaptureBottomLeft(index, row, col);
          const bottomRight = scanCaptureBottomRight(index, row, col);
          if (bottomLeft) {
            scanResult.push(bottomLeft);
          }
          if (bottomRight) {
            scanResult.push(bottomRight);
          }
        }
      }
    }
  }
  return scanResult;
}

function scanWhitePawn() {
  if (playerTurn !== 2) return false;
  let scanResult = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] === 2 && board[row][col] !== null) {
        for (let index = 0; index < 8; index++) {
          const topLeft = scanCaptureTopLeft(index, row, col);
          const topright = scanCaptureTopRight(index, row, col);
          if (topLeft) {
            scanResult.push(topLeft);
          }
          if (topright) {
            scanResult.push(topright);
          }
        }
      }
    }
  }
  return scanResult;
}

function scanWhiteKing() {
  if (playerTurn !== 2) return false;
  let scanResult = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] === 4 && board[row][col]) {
        // console.log(`found whiteking: row: ${row}, col: ${col}`);
        for (let index = 0; index < 8; index++) {
          const topLeft = scanCaptureTopLeft(index, row, col, "king");
          const topRight = scanCaptureTopRight(index, row, col, "king");
          const bottomRight = scanCaptureBottomRight(index, row, col, "king");
          const bottomLeft = scanCaptureBottomLeft(index, row, col, "king");

          if (topLeft) {
            scanResult.push(topLeft);
          }
          if (topRight) {
            scanResult.push(topRight);
          }
          if (bottomRight) {
            scanResult.push(bottomRight);
          }
          if (bottomLeft) {
            scanResult.push(bottomLeft);
          }
        }
      }
    }
  }
  return scanResult;
}

function scanBlackKing() {
  if (playerTurn !== 1) return false;
  let scanResult = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] === 3 && board[row][col]) {
        for (let index = 0; index < 8; index++) {
          const topLeft = scanCaptureTopLeft(index, row, col, "king");
          const topRight = scanCaptureTopRight(index, row, col, "king");
          const bottomRight = scanCaptureBottomRight(index, row, col, "king");
          const bottomLeft = scanCaptureBottomLeft(index, row, col, "king");

          if (topLeft) {
            scanResult.push(topLeft);
          }
          if (topRight) {
            scanResult.push(topRight);
          }
          if (bottomRight) {
            scanResult.push(bottomRight);
          }
          if (bottomLeft) {
            scanResult.push(bottomLeft);
          }
        }
      }
    }
  }
  return scanResult;
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
      movePieceAndRemove(selected.row, selected.col, row, col);
      if (readyCombo) {
        return;
      }
      changePlayerTurn();
      removeMark = 0;
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
  return;
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
