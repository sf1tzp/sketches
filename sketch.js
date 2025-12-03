const GRID_SIZE = 40; // Size of each grid square
let currentPalette;
let paletteColors;

function setup() {
  createCanvas(1920, 1080);
  frameRate(8);
  noStroke();
  pickNewPalette();

  // Change palette every second
  setInterval(pickNewPalette, 800);
}

function pickNewPalette() {
  currentPalette = random(pallets);
  // Convert palette object values to array of hex colors
  paletteColors = Object.values(currentPalette);
}

function draw() {
  background(20);

  // Calculate number of columns and rows
  const cols = ceil(width / GRID_SIZE);
  const rows = ceil(height / GRID_SIZE);

  // Loop through each grid cell
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * GRID_SIZE;
      const y = row * GRID_SIZE;

      // Randomly choose between square or triangle
      if (random() > 0.5) {
        // Draw a square with random color from palette
        const hexColor = random(paletteColors);
        fill('#' + hexColor);
        drawSquare(x, y);
      } else {
        // Draw a triangle with random gray value from gray palette
        const grayValue = random(GRAY_PALETTE);
        fill(grayValue);
        drawTriangle(x, y);
      }
    }
  }
}

function drawSquare(x, y) {
  // Draw square by connecting all 4 vertices
  beginShape();
  vertex(x, y);                         // Top-left
  vertex(x + GRID_SIZE, y);             // Top-right
  vertex(x + GRID_SIZE, y + GRID_SIZE); // Bottom-right
  vertex(x, y + GRID_SIZE);             // Bottom-left
  endShape(CLOSE);
}

function drawTriangle(x, y) {
  // Define the 4 corners
  const corners = [
    [x, y],                             // Top-left
    [x + GRID_SIZE, y],                 // Top-right
    [x + GRID_SIZE, y + GRID_SIZE],     // Bottom-right
    [x, y + GRID_SIZE]                  // Bottom-left
  ];

  // Randomly pick 3 of the 4 corners
  const skipIndex = floor(random(4));

  beginShape();
  for (let i = 0; i < 4; i++) {
    if (i !== skipIndex) {
      vertex(corners[i][0], corners[i][1]);
    }
  }
  endShape(CLOSE);
}

// Click to regenerate
function mousePressed() {
  redraw();
}
