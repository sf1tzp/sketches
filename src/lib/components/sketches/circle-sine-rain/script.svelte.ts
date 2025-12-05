import type p5 from 'p5';

// Configuration for this sketch
export interface SketchConfig {
    getStackInterval: () => number;
    getWaveAmplitude: () => number;
    getWaveFrequency: () => number;
    getRainDensity: () => number;
}

// Controller for pause/resume functionality
export interface SketchController {
    pause: () => void;
    resume: () => void;
}

interface RainDrop {
    x: number;
    y: number;
    size: number;
    alpha: number;
    color: { r: number; g: number; b: number };
}

// Background Color Palette:
const blackGoldElegance = {"Black":"000000","Prussian Blue":"14213d","Orange":"fca311","Alabaster Grey":"e5e5e5","White":"ffffff"}

// Main color palettes:
const mysticNight = {"Lavender Grey":"8895b3","Soft Periwinkle":"8e94f2","Wisteria Blue":"9fa0ff","Mauve":"bbadff","Mauve 2":"dab6fc"};
const rustNebula = {"Stone Brown":"5f5449","Smoky Rose":"9b6a6c","Rosy Taupe":"b09398","Azure Mist":"cedfd9","Azure Mist 2":"ebfcfb"};
const neptuneMoon = {"Strong Cyan":"52d1dc","Granite":"475b5a","Grey Olive":"8d8e8e","Cool Steel":"a3a9aa","Pale Slate":"bbbbbf"}

/**
 * Creates the p5 sketch with pause/resume support
 */
export function createSketch(
    container: HTMLElement,
    config: SketchConfig
): { sketch: (p: p5) => void; getController: () => SketchController } {
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

        let rainDrops: RainDrop[] = [];
        let time = 0;

        // Color palette for the sketch
        const palette = [
            { r: 100, g: 149, b: 237 }, // Cornflower blue
            { r: 135, g: 206, b: 250 }, // Light sky blue
            { r: 176, g: 224, b: 230 }, // Powder blue
            { r: 70, g: 130, b: 180 },  // Steel blue
            { r: 119, g: 136, b: 153 }, // Light slate gray
        ];

        p.setup = () => {
            const canvas = p.createCanvas(container.clientWidth, container.clientHeight);
            canvas.parent(container);
            p.background(20);
            p.frameRate(60);
            p.noStroke();
        };

        p.draw = () => {
            p.background(20, 20, 25);

            const stackInterval = config.getStackInterval();
            const waveAmplitude = config.getWaveAmplitude();
            const waveFrequency = config.getWaveFrequency();
            const rainDensity = config.getRainDensity();

            // Draw stacked ellipses along the sine wave
            const centerX = p.width / 2;

            // Draw from bottom to top
            for (let y = p.height; y > 0; y -= stackInterval) {
                // Sine wave rotated 90°: x offset based on y position
                const sineOffset = Math.sin((y * waveFrequency * 0.01) + time) * waveAmplitude;
                const x = centerX + sineOffset;

                // Calculate ellipse size based on position (larger at bottom)
                const normalizedY = y / p.height;
                const ellipseWidth = p.map(normalizedY, 0, 1, 30, 80);
                const ellipseHeight = ellipseWidth * 0.4;

                // Color gradient from top to bottom
                const colorIndex = Math.floor(p.map(y, 0, p.height, 0, palette.length - 0.01));
                const color = palette[colorIndex];

                // Draw ellipse with slight transparency
                p.fill(color.r, color.g, color.b, 150);
                p.ellipse(x, y, ellipseWidth, ellipseHeight);

                // Add a subtle glow effect
                p.fill(color.r, color.g, color.b, 30);
                p.ellipse(x, y, ellipseWidth * 1.3, ellipseHeight * 1.3);
            }

            // Add new rain drops
            const dropsToAdd = Math.floor(rainDensity * 0.5);
            for (let i = 0; i < dropsToAdd; i++) {
                const colorChoice = palette[Math.floor(p.random(palette.length))];
                rainDrops.push({
                    x: p.random(p.width),
                    y: p.random(p.height),
                    size: p.random(2, 6),
                    alpha: p.random(100, 200),
                    color: colorChoice
                });
            }

            // Draw and fade rain drops
            for (let i = rainDrops.length - 1; i >= 0; i--) {
                const drop = rainDrops[i];
                p.fill(drop.color.r, drop.color.g, drop.color.b, drop.alpha);
                p.ellipse(drop.x, drop.y, drop.size, drop.size);

                // Fade out the drop
                drop.alpha -= 3;

                // Remove faded drops
                if (drop.alpha <= 0) {
                    rainDrops.splice(i, 1);
                }
            }

            // Animate the sine wave
            time += 0.02;
        };

        p.windowResized = () => {
            p.resizeCanvas(container.clientWidth, container.clientHeight);
            rainDrops = []; // Clear rain drops on resize
        };
    };

    return { sketch, getController: () => controller };
}
