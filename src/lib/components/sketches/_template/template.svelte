<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import type p5Type from 'p5';
    import { createSketch, type SketchController } from './script.svelte';
    import SketchCard from '$lib/components/sketches/SketchCard.svelte';

    // Optional: Import icons for controls
    // import SomeIcon from '@lucide/svelte/icons/some-icon';

    // Optional: Import UI components for controls
    // import { Label } from "$lib/components/ui/label/index.js";
    // import * as RadioGroup from "$lib/components/ui/radio-group/index.js";

    interface Props {
        /** The index of this sketch in the carousel (for visibility tracking) */
        index?: number;
    }

    let { index = 0 }: Props = $props();

    let container: HTMLDivElement;
    let p5Instance: p5Type;
    let sketchController: SketchController | null = null;

    // Your reactive state for controls
    // let someValue = $state(0.5);

    onMount(async () => {
        const p5 = (await import('p5')).default;
        const { sketch, getController } = createSketch(container, {
            // Pass your config getters here
            // getSpeed: () => someValue,
        });
        p5Instance = new p5(sketch);
        sketchController = getController();
    });

    onDestroy(() => {
        if (p5Instance) {
            p5Instance.remove();
        }
    });

    // Handle pause/resume based on visibility from SketchCard
    function handleVisibilityChange(isActive: boolean) {
        if (sketchController) {
            if (isActive) {
                sketchController.resume();
            } else {
                sketchController.pause();
            }
        }
    }
</script>

{#snippet controls()}
    <!-- Your sketch-specific controls here -->
    <!-- Example:
    <div class="flex justify-start mx-2 mt-8 gap-4">
        <span class="text-muted-foreground font-mono">Your controls here</span>
    </div>
    -->
{/snippet}

<SketchCard title="your-sketch-name" {index} {controls}>
    {#snippet children({ isActive })}
        {@const _ = handleVisibilityChange(isActive)}
        <div bind:this={container} class="size-full overflow-clip touch-pan-y"></div>
    {/snippet}
</SketchCard>
