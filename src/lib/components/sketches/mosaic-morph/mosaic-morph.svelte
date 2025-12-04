<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import type p5Type from 'p5';
    import { createSketch, GRID_SIZE_MIN, GRID_SIZE_MAX, TRANSITION_FRAMES_MIN, TRANSITION_FRAMES_MAX, type SketchController } from './script.svelte';
    import SketchCard from '$lib/components/sketches/SketchCard.svelte';
    import Gauge from '@lucide/svelte/icons/gauge';
    import Puzzle from '@lucide/svelte/icons/puzzle';

    import { Label } from "$lib/components/ui/label/index.js";
    import * as RadioGroup from "$lib/components/ui/radio-group/index.js";

    interface Props {
        /** The index of this sketch in the carousel (for visibility tracking) */
        index?: number;
    }

    let { index = 0 }: Props = $props();

    let container: HTMLDivElement;
    let p5Instance: p5Type;
    let sketchController: SketchController | null = null;
    let triggerSizeChange: (() => void) | null = null;

    let gridSizeValue = $state(0.4);
    let speedValue = $state(0.667);

    // Convert slider values (0-1) to actual config values
    // Grid size: 0 = min, 1 = max
    function getGridSize() {
        return Math.round(GRID_SIZE_MIN + gridSizeValue * (GRID_SIZE_MAX - GRID_SIZE_MIN));
    }

    // Speed: 0 = slow (high frames), 1 = fast (low frames)
    // Note: low frame values are faster
    function getTransitionFrames() {
        return Math.round(TRANSITION_FRAMES_MAX - speedValue * (TRANSITION_FRAMES_MAX - TRANSITION_FRAMES_MIN));
    }

    // Trigger redraw when grid size changes
    $effect(() => {
        gridSizeValue; // track dependency
        if (triggerSizeChange) {
            triggerSizeChange();
        }
    });

    onMount(async () => {
        const p5 = (await import('p5')).default;
        const { sketch, getController } = createSketch(container, {
            getGridSize,
            getTransitionFrames,
            onSizeChange: (callback) => {
                triggerSizeChange = callback;
            }
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
    <div class="flex justify-start mx-2 mt-8 gap-4">
        <div class="flex gap-2">
            <Puzzle class="size-4 mt-1 font-light text-muted-foreground"/>
            <h2 class="font-light text-muted-foreground hidden sm:inline-block font-mono">size</h2>
        </div>
        <RadioGroup.Root value="0.4" onValueChange={(v) => gridSizeValue = parseFloat(v)} class="flex flex-row gap-4">
          <div class="flex items-center space-x-2">
            <RadioGroup.Item value="0.1" id="size-small" />
            <Label for="size-small" class="text-muted-foreground font-mono">small</Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroup.Item value="0.4" id="size-med" />
            <Label for="size-med" class="text-muted-foreground font-mono">med</Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroup.Item value="0.7" id="size-large" />
            <Label for="size-large" class="text-muted-foreground font-mono">large</Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroup.Item value="1" id="size-xl" />
            <Label for="size-xl" class="text-muted-foreground font-mono">xl</Label>
          </div>
        </RadioGroup.Root>
    </div>
    <div class="flex justify-start mx-2 mt-8 gap-4">
        <div class="flex gap-2">
            <Gauge class="size-4 mt-1 font-light text-muted-foreground"/>
            <h2 class="font-light text-muted-foreground font-mono hidden sm:inline-block">speed</h2>
        </div>
        <RadioGroup.Root value="0.8" onValueChange={(v) => speedValue = parseFloat(v)} class="flex flex-row gap-4">
          <div class="flex items-center space-x-2">
            <RadioGroup.Item value="0.2" id="speed-slow" />
            <Label for="size-small" class="text-muted-foreground font-mono">slow</Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroup.Item value="0.8" id="speed-med" />
            <Label for="size-med" class="text-muted-foreground font-mono">med</Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroup.Item value="0.9" id="speed-fast" />
            <Label for="size-large" class="text-muted-foreground font-mono">fast</Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroup.Item value="0.967" id="speed-xl" />
            <Label for="size-xl" class="text-muted-foreground font-mono">flash</Label>
          </div>
        </RadioGroup.Root>
    </div>
{/snippet}

<SketchCard title="mosaic morph" {index} {controls}>
    {#snippet children({ isActive })}
        {@const _ = handleVisibilityChange(isActive)}
        <div bind:this={container} class="size-full overflow-clip touch-pan-y"></div>
    {/snippet}
</SketchCard>