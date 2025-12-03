const GRID_SIZE = 24; // Size of each grid square
const REGION_THRESHOLD = 4; // Regions with more cells than this use palette colors
const MERGE_PROBABILITY = 0.5; // Chance to merge adjacent cells into same region
const MAX_REGION_SIZE = 24; // Maximum number of cells in a region
const BLUR_AMOUNT = 2; // Gaussian blur radius in pixels

// Animation settings
const TRANSITION_FRAMES = 5; // Number of frames to transition between states
const EASING_TYPE = 'easeInOutCubic'; // 'linear', 'easeInOutCubic', 'easeInOutQuad'

let currentPallet;
let palletColors;
let grid;
let regions;
let cols, rows;

// Animation state
let currentState = null;  // Current frame's cell data
let nextState = null;     // Target frame's cell data
let transitionProgress = 1; // 0 to 1, 1 means transition complete
let frameCounter = 0;

function setup() {
  // createCanvas(512, 512);
  createCanvas(1920, 1080);
  // createCanvas(3840,2160);
  // createCanvas(3840,2160);
  // createCanvas(5120, 2880);
  noStroke();
  pickNewPallet();

  // Apply Gaussian blur to the canvas
  drawingContext.filter = `blur(${BLUR_AMOUNT}px)`;

  // Initialize first state
  generateRegions();
  currentState = captureState();
  nextState = captureState();

  frameRate(60); // Higher framerate for smooth animation
}

function pickNewPallet() {
  currentPallet = random(pallets);
  // Convert palette object values to array of hex colors
  palletColors = Object.values(currentPallet);
}

// Easing functions for smooth animations
function easeLinear(t) {
  return t;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function getEasing(t) {
  switch (EASING_TYPE) {
    case 'easeInOutCubic': return easeInOutCubic(t);
    case 'easeInOutQuad': return easeInOutQuad(t);
    default: return easeLinear(t);
  }
}

// Capture current state for animation
function captureState() {
  const state = [];
  for (let i = 0; i < grid.length; i++) {
    const cell = grid[i];
    const region = regions.get(cell.regionRoot);
    state.push({
      color: color(region.color),
      isSquare: cell.isSquare,
      skipCorner: cell.skipCorner
    });
  }
  return state;
}

// Lerp between two colors
function lerpColor2(c1, c2, amt) {
  const r = lerp(red(c1), red(c2), amt);
  const g = lerp(green(c1), green(c2), amt);
  const b = lerp(blue(c1), blue(c2), amt);
  return color(r, g, b);
}

// Union-Find data structure for grouping cells into regions
class UnionFind {
  constructor(size) {
    this.parent = Array.from({ length: size }, (_, i) => i);
    this.rank = Array(size).fill(0);
    this.size = Array(size).fill(1); // Track size of each region
  }

  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // Path compression
    }
    return this.parent[x];
  }

  getSize(x) {
    return this.size[this.find(x)];
  }

  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return false;

    // Check if merged region would exceed max size
    if (this.size[rootX] + this.size[rootY] > MAX_REGION_SIZE) {
      return false;
    }

    // Union by rank
    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
      this.size[rootY] += this.size[rootX];
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
      this.size[rootX] += this.size[rootY];
    } else {
      this.parent[rootY] = rootX;
      this.size[rootX] += this.size[rootY];
      this.rank[rootX]++;
    }
    return true;
  }
}

function generateRegions() {
  cols = ceil(width / GRID_SIZE);
  rows = ceil(height / GRID_SIZE);
  const totalCells = cols * rows;

  // Create grid with random shape types (0 = square, 1-4 = triangle variants)
  grid = [];
  for (let i = 0; i < totalCells; i++) {
    grid[i] = {
      isSquare: random() > 0.5,
      skipCorner: floor(random(4)) // Which corner to skip for triangles
    };
  }

  // Create union-find and randomly merge adjacent cells
  const uf = new UnionFind(totalCells);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const idx = row * cols + col;

      // Try to merge with right neighbor
      if (col < cols - 1 && random() < MERGE_PROBABILITY) {
        uf.union(idx, idx + 1);
      }
      // Try to merge with bottom neighbor
      if (row < rows - 1 && random() < MERGE_PROBABILITY) {
        uf.union(idx, idx + cols);
      }
    }
  }

  // Group cells by their region root and calculate sizes
  const regionMap = new Map();
  for (let i = 0; i < totalCells; i++) {
    const root = uf.find(i);
    if (!regionMap.has(root)) {
      regionMap.set(root, { cells: [], color: null });
    }
    regionMap.get(root).cells.push(i);
  }

  // Assign colors based on region size
  for (const [root, region] of regionMap) {
    if (region.cells.length > REGION_THRESHOLD) {
      // Large region: use palette color
      const hexColor = random(palletColors);
      region.color = '#' + hexColor;
    } else {
      // Small region: use gray palette
      const grayValue = random(pallets[2]);
      region.color = grayValue;
    }
  }

  regions = regionMap;

  // Store region root for each cell for quick lookup
  grid.forEach((cell, i) => {
    cell.regionRoot = uf.find(i);
  });
}

function draw() {
  background(20);

  // Check if we need to start a new transition
  if (transitionProgress >= 1) {
    // Transition complete, generate new target state
    currentState = nextState;

    // Occasionally pick a new palette
    if (random() < 0.6) {
      pickNewPallet();
    }

    generateRegions();
    nextState = captureState();
    transitionProgress = 0;
  }

  // Calculate eased progress
  const easedProgress = getEasing(transitionProgress);

  // Loop through each grid cell and draw interpolated state
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * GRID_SIZE;
      const y = row * GRID_SIZE;
      const idx = row * cols + col;

      const currCell = currentState[idx];
      const nextCell = nextState[idx];

      // Interpolate color
      const interpolatedColor = lerpColor2(currCell.color, nextCell.color, easedProgress);
      fill(interpolatedColor);

      // For shape morphing, we blend between shapes
      if (currCell.isSquare === nextCell.isSquare) {
        // Same shape type, just draw it
        if (currCell.isSquare) {
          drawSquare(x, y);
        } else {
          // Interpolate between skip corners if different
          if (currCell.skipCorner === nextCell.skipCorner) {
            drawTriangle(x, y, currCell.skipCorner);
          } else {
            // Morph between triangles using animated corner
            drawMorphingTriangle(x, y, currCell.skipCorner, nextCell.skipCorner, easedProgress);
          }
        }
      } else {
        // Shape type is changing - morph between square and triangle
        drawMorphingShape(x, y, currCell, nextCell, easedProgress);
      }
    }
  }

  // Advance transition
  transitionProgress += 1 / TRANSITION_FRAMES;
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

function drawTriangle(x, y, skipCorner) {
  // Define the 4 corners
  const corners = [
    [x, y],                             // Top-left
    [x + GRID_SIZE, y],                 // Top-right
    [x + GRID_SIZE, y + GRID_SIZE],     // Bottom-right
    [x, y + GRID_SIZE]                  // Bottom-left
  ];

  beginShape();
  for (let i = 0; i < 4; i++) {
    if (i !== skipCorner) {
      vertex(corners[i][0], corners[i][1]);
    }
  }
  endShape(CLOSE);
}

// Morph between two triangles with different skip corners
function drawMorphingTriangle(x, y, fromSkip, toSkip, progress) {
  const corners = [
    [x, y],                             // Top-left
    [x + GRID_SIZE, y],                 // Top-right
    [x + GRID_SIZE, y + GRID_SIZE],     // Bottom-right
    [x, y + GRID_SIZE]                  // Bottom-left
  ];

  // Calculate center point for morphing
  const centerX = x + GRID_SIZE / 2;
  const centerY = y + GRID_SIZE / 2;

  beginShape();
  for (let i = 0; i < 4; i++) {
    let px = corners[i][0];
    let py = corners[i][1];

    if (i === fromSkip) {
      // This corner is disappearing - move toward center
      px = lerp(centerX, corners[i][0], progress);
      py = lerp(centerY, corners[i][1], progress);
    } else if (i === toSkip) {
      // This corner will disappear - move toward center
      px = lerp(corners[i][0], centerX, progress);
      py = lerp(corners[i][1], centerY, progress);
    }

    vertex(px, py);
  }
  endShape(CLOSE);
}

// Morph between square and triangle
function drawMorphingShape(x, y, fromCell, toCell, progress) {
  const corners = [
    [x, y],                             // Top-left
    [x + GRID_SIZE, y],                 // Top-right
    [x + GRID_SIZE, y + GRID_SIZE],     // Bottom-right
    [x, y + GRID_SIZE]                  // Bottom-left
  ];

  const centerX = x + GRID_SIZE / 2;
  const centerY = y + GRID_SIZE / 2;

  beginShape();
  for (let i = 0; i < 4; i++) {
    let px = corners[i][0];
    let py = corners[i][1];

    if (fromCell.isSquare && !toCell.isSquare && i === toCell.skipCorner) {
      // Morphing from square to triangle - shrink this corner toward center
      px = lerp(corners[i][0], centerX, progress);
      py = lerp(corners[i][1], centerY, progress);
    } else if (!fromCell.isSquare && toCell.isSquare && i === fromCell.skipCorner) {
      // Morphing from triangle to square - expand this corner from center
      px = lerp(centerX, corners[i][0], progress);
      py = lerp(centerY, corners[i][1], progress);
    }

    vertex(px, py);
  }
  endShape(CLOSE);
}

// // Click to regenerate
// function mousePressed() {
//   redraw();
// }
