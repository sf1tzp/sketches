import type p5 from 'p5';

// Configuration for this sketch
export interface SketchConfig {
    // Add your sketch-specific configuration getters here
    // Example: getSpeed: () => number;
}

// Controller for pause/resume functionality
export interface SketchController {
    pause: () => void;
    resume: () => void;
}

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

        // Your sketch variables here
        // let someValue: number;

        p.setup = () => {
            const canvas = p.createCanvas(container.clientWidth, container.clientHeight);
            canvas.parent(container);

            // Your setup code here
            p.background(20);
            p.frameRate(60);
        };

        p.draw = () => {
            // Your draw code here
            // This will automatically pause when the sketch is not visible
            p.background(20);

            // Example: draw something
            p.fill(255);
            p.ellipse(p.width / 2, p.height / 2, 100, 100);
        };

        p.windowResized = () => {
            p.resizeCanvas(container.clientWidth, container.clientHeight);
            // Handle resize if needed
        };
    };

    return { sketch, getController: () => controller };
}
