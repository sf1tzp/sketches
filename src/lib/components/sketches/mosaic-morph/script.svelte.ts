import type p5 from 'p5';

// Configuration defaults
export const GRID_SIZE_MIN = 12;
export const GRID_SIZE_MAX = 75;
export const TRANSITION_FRAMES_MIN = 15;
export const TRANSITION_FRAMES_MAX = 270;

export const REGION_THRESHOLD = 16;
export const MAX_REGION_SIZE = 36;

export const MERGE_PROBABILITY = 0.5;
export const EASING_TYPE: 'linear' | 'easeInOutCubic' | 'easeInOutQuad' = 'easeInOutCubic';

const PALETTE_CHANGE_PROBABILITY = 0.85;
const BACKGROUND_COLOR = 20;

// Palettes
export const earthy = { "Coffee Bean": "230903", "Ebony": "656256", "Muted Teal": "9ebc9f", "Tan": "d3b88c", "White Smoke": "f4f2f3" };
export const sunset = { "Cherry Rose": "a40e4c", "Space Indigo": "2c2c54", "Ash Grey": "acc3a6", "Soft Apricot": "f5d6ba", "Tangerine Dream": "f49d6e" };
export const desertNight = { "Sandy Clay": "e1b07e", "Desert Sand": "e5be9e", "Pale Oak": "cbc0ad", "Muted Teal": "86a397", "Midnight Violet": "361d2e" };
export const marble = { "Dust Grey": "e2dadb", "Alabaster Grey": "dae2df", "Ash Grey": "a2a7a5", "Dim Grey": "6d696a", "White": "ffffff" };

export const palettes = [earthy, sunset, desertNight, sunset, marble];

// Types
interface CellState {
    color: p5.Color;
    isSquare: boolean;
    skipCorner: number;
}

interface GridCell {
    isSquare: boolean;
    skipCorner: number;
    regionRoot: number;
}

interface Region {
    cells: number[];
    color: string | null;
}

// Union-Find data structure
export class UnionFind {
    parent: number[];
    rank: number[];
    size: number[];

    constructor(size: number) {
        this.parent = Array.from({ length: size }, (_, i) => i);
        this.rank = Array(size).fill(0);
        this.size = Array(size).fill(1);
    }

    find(x: number): number {
        if (this.parent[x] !== x) {
            this.parent[x] = this.find(this.parent[x]);
        }
        return this.parent[x];
    }

    getSize(x: number): number {
        return this.size[this.find(x)];
    }

    union(x: number, y: number): boolean {
        const rootX = this.find(x);
        const rootY = this.find(y);
        if (rootX === rootY) return false;

        if (this.size[rootX] + this.size[rootY] > MAX_REGION_SIZE) {
            return false;
        }

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

// Easing functions
export function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function getEasing(t: number): number {
    switch (EASING_TYPE) {
        case 'easeInOutCubic': return easeInOutCubic(t);
        case 'easeInOutQuad': return easeInOutQuad(t);
        default: return t;
    }
}

// Sketch configuration interface
export interface SketchConfig {
    getGridSize: () => number;
    getTransitionFrames: () => number;
    onSizeChange?: (callback: () => void) => void;
}

// Controller for pause/resume functionality
export interface SketchController {
    pause: () => void;
    resume: () => void;
}

// Create the sketch function
export function createSketch(container: HTMLElement, config: SketchConfig): { sketch: (p: p5) => void; getController: () => SketchController } {
    let isPaused = false;
    let p5Ref: p5 | null = null;

    const controller: SketchController = {
        pause: () => {
            isPaused = true;
            if (p5Ref) {
                p5Ref.noLoop();
            }
        },
        resume: () => {
            isPaused = false;
            if (p5Ref) {
                p5Ref.loop();
            }
        }
    };

    const sketch = (p: p5) => {
        p5Ref = p;
        let currentPalette: Record<string, string>;
        let paletteColors: string[];
        let grid: GridCell[];
        let regions: Map<number, Region>;
        let cols: number;
        let rows: number;
        let currentState: CellState[] | null = null;
        let nextState: CellState[] | null = null;
        let transitionProgress = 1;
        let paletteIndex = 0;
        let currentGridSize: number;

        // Pre-allocated corners array to avoid repeated allocations in draw loop
        const corners: [number, number][] = [[0, 0], [0, 0], [0, 0], [0, 0]];

        function updateCorners(x: number, y: number): void {
            corners[0][0] = x;                     corners[0][1] = y;
            corners[1][0] = x + currentGridSize;  corners[1][1] = y;
            corners[2][0] = x + currentGridSize;  corners[2][1] = y + currentGridSize;
            corners[3][0] = x;                     corners[3][1] = y + currentGridSize;
        }

        function pickNewPalette(): void {
            paletteIndex = (paletteIndex + 1) % palettes.length;
            currentPalette = palettes[paletteIndex];
            paletteColors = Object.values(currentPalette);
        }

        function captureState(): CellState[] {
            const state: CellState[] = [];
            for (let i = 0; i < grid.length; i++) {
                const cell = grid[i];
                const region = regions.get(cell.regionRoot)!;
                state.push({
                    color: p.color(region.color!),
                    isSquare: cell.isSquare,
                    skipCorner: cell.skipCorner
                });
            }
            return state;
        }

        // Reuse an existing array if the size matches, otherwise allocate new
        function captureStateInto(existing: CellState[] | null): CellState[] {
            if (!existing || existing.length !== grid.length) {
                return captureState();
            }
            for (let i = 0; i < grid.length; i++) {
                const cell = grid[i];
                const region = regions.get(cell.regionRoot)!;
                existing[i].color = p.color(region.color!);
                existing[i].isSquare = cell.isSquare;
                existing[i].skipCorner = cell.skipCorner;
            }
            return existing;
        }

        function lerpColor2(c1: p5.Color, c2: p5.Color, amt: number): p5.Color {
            const r = p.lerp(p.red(c1), p.red(c2), amt);
            const g = p.lerp(p.green(c1), p.green(c2), amt);
            const b = p.lerp(p.blue(c1), p.blue(c2), amt);
            return p.color(r, g, b);
        }

        function generateRegions(): void {
            currentGridSize = config.getGridSize();
            cols = p.ceil(p.width / currentGridSize);
            rows = p.ceil(p.height / currentGridSize);
            const totalCells = cols * rows;

            grid = [];
            for (let i = 0; i < totalCells; i++) {
                grid[i] = {
                    isSquare: p.random() > 0.5,
                    skipCorner: p.floor(p.random(4)),
                    regionRoot: 0
                };
            }

            const uf = new UnionFind(totalCells);

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const idx = row * cols + col;

                    if (col < cols - 1 && p.random() < MERGE_PROBABILITY) {
                        uf.union(idx, idx + 1);
                    }
                    if (row < rows - 1 && p.random() < MERGE_PROBABILITY) {
                        uf.union(idx, idx + cols);
                    }
                }
            }

            const regionMap = new Map<number, Region>();
            for (let i = 0; i < totalCells; i++) {
                const root = uf.find(i);
                if (!regionMap.has(root)) {
                    regionMap.set(root, { cells: [], color: null });
                }
                regionMap.get(root)!.cells.push(i);
            }

            for (const [, region] of regionMap) {
                if (region.cells.length > REGION_THRESHOLD) {
                    const hexColor = p.random(paletteColors);
                    region.color = '#' + hexColor;
                } else {
                    const grayValue = p.random(Object.values(marble));
                    region.color = '#' + grayValue;
                }
            }

            regions = regionMap;

            grid.forEach((cell, i) => {
                cell.regionRoot = uf.find(i);
            });
        }

        function drawSquare(x: number, y: number): void {
            p.beginShape();
            p.vertex(x, y);
            p.vertex(x + currentGridSize, y);
            p.vertex(x + currentGridSize, y + currentGridSize);
            p.vertex(x, y + currentGridSize);
            p.endShape(p.CLOSE);
        }

        function drawTriangle(x: number, y: number, skipCorner: number): void {
            updateCorners(x, y);
            p.beginShape();
            for (let i = 0; i < 4; i++) {
                if (i !== skipCorner) {
                    p.vertex(corners[i][0], corners[i][1]);
                }
            }
            p.endShape(p.CLOSE);
        }

        function drawMorphingTriangle(x: number, y: number, fromSkip: number, toSkip: number, progress: number): void {
            updateCorners(x, y);
            const centerX = x + currentGridSize / 2;
            const centerY = y + currentGridSize / 2;

            p.beginShape();
            for (let i = 0; i < 4; i++) {
                let px = corners[i][0];
                let py = corners[i][1];

                if (i === fromSkip) {
                    px = p.lerp(centerX, corners[i][0], progress);
                    py = p.lerp(centerY, corners[i][1], progress);
                } else if (i === toSkip) {
                    px = p.lerp(corners[i][0], centerX, progress);
                    py = p.lerp(corners[i][1], centerY, progress);
                }

                p.vertex(px, py);
            }
            p.endShape(p.CLOSE);
        }

        function drawMorphingShape(x: number, y: number, fromCell: CellState, toCell: CellState, progress: number): void {
            updateCorners(x, y);
            const centerX = x + currentGridSize / 2;
            const centerY = y + currentGridSize / 2;

            p.beginShape();
            for (let i = 0; i < 4; i++) {
                let px = corners[i][0];
                let py = corners[i][1];

                if (fromCell.isSquare && !toCell.isSquare && i === toCell.skipCorner) {
                    px = p.lerp(corners[i][0], centerX, progress);
                    py = p.lerp(corners[i][1], centerY, progress);
                } else if (!fromCell.isSquare && toCell.isSquare && i === fromCell.skipCorner) {
                    px = p.lerp(centerX, corners[i][0], progress);
                    py = p.lerp(centerY, corners[i][1], progress);
                }

                p.vertex(px, py);
            }
            p.endShape(p.CLOSE);
        }

        p.setup = () => {
            const canvas = p.createCanvas(container.clientWidth, container.clientHeight);
            canvas.parent(container);
            p.noStroke();
            pickNewPalette();

            generateRegions();
            currentState = captureState();
            nextState = captureState();

            // Register size change callback to trigger regeneration
            if (config.onSizeChange) {
                config.onSizeChange(() => {
                    generateRegions();
                    currentState = captureState();
                    nextState = captureState();
                    transitionProgress = 0;
                });
            }

            p.frameRate(60);
        };

        p.draw = () => {
            p.background(BACKGROUND_COLOR);

            if (transitionProgress >= 1) {
                // Swap states - reuse the old currentState array for the next capture
                const temp = currentState;
                currentState = nextState;

                if (p.random() < PALETTE_CHANGE_PROBABILITY) {
                    pickNewPalette();
                }

                generateRegions();
                // Reuse the old array if possible, otherwise capture fresh
                nextState = captureStateInto(temp);
                transitionProgress = 0;
            }

            const easedProgress = getEasing(transitionProgress);

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const x = col * currentGridSize;
                    const y = row * currentGridSize;
                    const idx = row * cols + col;

                    const currCell = currentState![idx];
                    const nextCell = nextState![idx];

                    const interpolatedColor = p.lerpColor(currCell.color, nextCell.color, easedProgress);
                    p.fill(interpolatedColor);

                    if (currCell.isSquare === nextCell.isSquare) {
                        if (currCell.isSquare) {
                            drawSquare(x, y);
                        } else {
                            if (currCell.skipCorner === nextCell.skipCorner) {
                                drawTriangle(x, y, currCell.skipCorner);
                            } else {
                                drawMorphingTriangle(x, y, currCell.skipCorner, nextCell.skipCorner, easedProgress);
                            }
                        }
                    } else {
                        drawMorphingShape(x, y, currCell, nextCell, easedProgress);
                    }
                }
            }

            transitionProgress += 1 / config.getTransitionFrames();
        };

        p.windowResized = () => {
            p.resizeCanvas(container.clientWidth, container.clientHeight);
            generateRegions();
            currentState = captureState();
            nextState = captureState();
        };
    };

    return { sketch, getController: () => controller };
}
