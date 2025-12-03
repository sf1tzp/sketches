const GRID_SIZE = 15; // Size of each grid square
const REGION_THRESHOLD = 5; // Regions with more cells than this use palette colors
const MERGE_PROBABILITY = 0.5; // Chance to merge adjacent cells into same region
const MAX_REGION_SIZE = 25; // Maximum number of cells in a region

let currentPalette;
let paletteColors;
let grid;
let regions;
let cols, rows;

function setup() {
  // createCanvas(2560, 1440);
  // createCanvas(3840,2160);
  createCanvas(3840,2160);
  // createCanvas(5120, 2880);
  noStroke();
  pickNewPalette();
  // redraw();

  // Change palette every second
  setInterval(pickNewPalette, 8000);
  frameRate(8);
}

function pickNewPalette() {
  currentPalette = random(pallets);
  // Convert palette object values to array of hex colors
  paletteColors = Object.values(currentPalette);
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
      const hexColor = random(paletteColors);
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

  // Generate new regions each frame
  generateRegions();

  // Loop through each grid cell
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * GRID_SIZE;
      const y = row * GRID_SIZE;
      const idx = row * cols + col;
      const cell = grid[idx];
      const region = regions.get(cell.regionRoot);

      // Set the region's color
      fill(region.color);

      if (cell.isSquare) {
        drawSquare(x, y);
      } else {
        drawTriangle(x, y, cell.skipCorner);
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

// Click to regenerate
function mousePressed() {
  redraw();
}
