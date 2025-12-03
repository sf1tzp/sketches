import type p5 from 'p5';

// Configuration
export const GRID_SIZE = 16;
export const REGION_THRESHOLD = 4;
export const MERGE_PROBABILITY = 0.5;
export const MAX_REGION_SIZE = 24;
export const BLUR_AMOUNT = 2;
export const TRANSITION_FRAMES = 25;
export const EASING_TYPE: 'linear' | 'easeInOutCubic' | 'easeInOutQuad' = 'easeInOutCubic';

// Palettes
export const earthy = { "Coffee Bean": "230903", "Ebony": "656256", "Muted Teal": "9ebc9f", "Tan": "d3b88c", "White Smoke": "f4f2f3" };
export const sunset = { "Cherry Rose": "a40e4c", "Space Indigo": "2c2c54", "Ash Grey": "acc3a6", "Soft Apricot": "f5d6ba", "Tangerine Dream": "f49d6e" };
export const desertNight = { "Sandy Clay": "e1b07e", "Desert Sand": "e5be9e", "Pale Oak": "cbc0ad", "Muted Teal": "86a397", "Midnight Violet": "361d2e" };
export const marble = { "Dust Grey": "e2dadb", "Alabaster Grey": "dae2df", "Ash Grey": "a2a7a5", "Dim Grey": "6d696a", "White": "ffffff" };

export const pallets = [earthy, sunset, desertNight];

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

// Create the sketch function
export function createSketch(container: HTMLElement) {
    return (p: p5) => {
        let currentPallet: Record<string, string>;
        let palletColors: string[];
        let grid: GridCell[];
        let regions: Map<number, Region>;
        let cols: number;
        let rows: number;
        let currentState: CellState[] | null = null;
        let nextState: CellState[] | null = null;
        let transitionProgress = 1;

        function pickNewPallet(): void {
            currentPallet = p.random(pallets);
            palletColors = Object.values(currentPallet);
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

        function lerpColor2(c1: p5.Color, c2: p5.Color, amt: number): p5.Color {
            const r = p.lerp(p.red(c1), p.red(c2), amt);
            const g = p.lerp(p.green(c1), p.green(c2), amt);
            const b = p.lerp(p.blue(c1), p.blue(c2), amt);
            return p.color(r, g, b);
        }

        function generateRegions(): void {
            cols = p.ceil(p.width / GRID_SIZE);
            rows = p.ceil(p.height / GRID_SIZE);
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
                    const hexColor = p.random(palletColors);
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
            p.vertex(x + GRID_SIZE, y);
            p.vertex(x + GRID_SIZE, y + GRID_SIZE);
            p.vertex(x, y + GRID_SIZE);
            p.endShape(p.CLOSE);
        }

        function drawTriangle(x: number, y: number, skipCorner: number): void {
            const corners: [number, number][] = [
                [x, y],
                [x + GRID_SIZE, y],
                [x + GRID_SIZE, y + GRID_SIZE],
                [x, y + GRID_SIZE]
            ];

            p.beginShape();
            for (let i = 0; i < 4; i++) {
                if (i !== skipCorner) {
                    p.vertex(corners[i][0], corners[i][1]);
                }
            }
            p.endShape(p.CLOSE);
        }

        function drawMorphingTriangle(x: number, y: number, fromSkip: number, toSkip: number, progress: number): void {
            const corners: [number, number][] = [
                [x, y],
                [x + GRID_SIZE, y],
                [x + GRID_SIZE, y + GRID_SIZE],
                [x, y + GRID_SIZE]
            ];

            const centerX = x + GRID_SIZE / 2;
            const centerY = y + GRID_SIZE / 2;

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
            const corners: [number, number][] = [
                [x, y],
                [x + GRID_SIZE, y],
                [x + GRID_SIZE, y + GRID_SIZE],
                [x, y + GRID_SIZE]
            ];

            const centerX = x + GRID_SIZE / 2;
            const centerY = y + GRID_SIZE / 2;

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
            pickNewPallet();

            // Apply blur filter (only works with 2D context)
            const ctx = p.drawingContext as CanvasRenderingContext2D;
            ctx.filter = `blur(${BLUR_AMOUNT}px)`;

            generateRegions();
            currentState = captureState();
            nextState = captureState();

            p.frameRate(60);
        };

        p.draw = () => {
            p.background(20);

            if (transitionProgress >= 1) {
                currentState = nextState;

                if (p.random() < 0.6) {
                    pickNewPallet();
                }

                generateRegions();
                nextState = captureState();
                transitionProgress = 0;
            }

            const easedProgress = getEasing(transitionProgress);

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const x = col * GRID_SIZE;
                    const y = row * GRID_SIZE;
                    const idx = row * cols + col;

                    const currCell = currentState![idx];
                    const nextCell = nextState![idx];

                    const interpolatedColor = lerpColor2(currCell.color, nextCell.color, easedProgress);
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

            transitionProgress += 1 / TRANSITION_FRAMES;
        };

        p.windowResized = () => {
            p.resizeCanvas(container.clientWidth, container.clientHeight);
            generateRegions();
            currentState = captureState();
            nextState = captureState();
        };
    };
}
