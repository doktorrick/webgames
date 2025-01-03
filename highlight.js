function drawNeonHighlight() {
  if (selected) {
    if (selected.col < 0 || selected.col > 7) return;

    const x = selected.col * gridSize;
    const y = selected.row * gridSize;

    // Neon glow effect layers
    const glowColor = "yellow";
    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgba(255, 255, 0, 0.3)"; // Outer glow
    ctx.strokeRect(x, y, gridSize, gridSize);

    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgba(255, 255, 0, 0.5)"; // Mid glow
    ctx.strokeRect(x, y, gridSize, gridSize);

    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgba(255, 255, 0, 0.7)"; // Inner glow
    ctx.strokeRect(x, y, gridSize, gridSize);

    // Solid highlight
    ctx.lineWidth = 6;
    ctx.strokeStyle = glowColor; // Solid color
    ctx.strokeRect(x, y, gridSize, gridSize);
  }
}
