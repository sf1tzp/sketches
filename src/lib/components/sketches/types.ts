import type p5 from 'p5';

/**
 * Interface for sketch factories that support pause/resume
 * All sketches should implement this pattern to allow resource management
 */
export interface SketchController {
    /** Pause the draw loop (called when sketch is not visible) */
    pause: () => void;
    /** Resume the draw loop (called when sketch becomes visible) */
    resume: () => void;
    /** Clean up resources (called on destroy) */
    destroy: () => void;
}

/**
 * A sketch factory function that creates a p5 sketch with lifecycle controls
 */
export type SketchFactory = (p: p5) => void;

/**
 * Extended sketch factory that returns a controller for pause/resume
 */
export interface SketchWithController {
    sketch: SketchFactory;
    getController: () => SketchController;
}
