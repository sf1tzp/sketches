<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import type p5Type from 'p5';
    import { createSketch, GRID_SIZE_MIN, GRID_SIZE_MAX, TRANSITION_FRAMES_MIN, TRANSITION_FRAMES_MAX } from './script.svelte';
    import * as Card from '$lib/components/ui/card/index.js';
    import Slider from '$lib/components/ui/slider/slider.svelte';
    import Gauge from '@lucide/svelte/icons/gauge';
    import Puzzle from '@lucide/svelte/icons/puzzle';
    import CardTitle from '$lib/components/ui/card/card-title.svelte';

    import { Label } from "$lib/components/ui/label/index.js";
    import * as RadioGroup from "$lib/components/ui/radio-group/index.js";

    let container: HTMLDivElement;
    let p5Instance: p5Type;
    let triggerSizeChange: (() => void) | null = null;

    let gridSizeValue = $state(0.5);
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
        p5Instance = new p5(createSketch(container, {
            getGridSize,
            getTransitionFrames,
            onSizeChange: (callback) => {
                triggerSizeChange = callback;
            }
        }));
    });

    onDestroy(() => {
        if (p5Instance) {
            p5Instance.remove();
        }
    });
</script>


<Card.Root class="max-w-lg h-vh mx-4 mb-4 sm:mx-auto">
    <Card.Header>
        <Card.Title class="font-light text-center text-ld">mosaic morph</Card.Title>
    </Card.Header>
    <Card.Content class="flex flex-col px-4">
        <div class="w-full h-100 sm:h-128">
            <div bind:this={container} class="size-full overflow-clip touch-pan-y"></div>
        </div>
        <div class="flex justify-end px-4 mt-8">
            <Puzzle class="size-8 mr-4 pb-1 text-muted-foreground"/>
            <h2 class="mr-4 text-muted-foreground">Size {gridSizeValue}</h2>
            <Slider type="single" bind:value={gridSizeValue} max={1} min={0.1} step={0.3} class="" ></Slider>
        </div>
        <div class="flex">
            <!-- small = 0.1 -->
            <!-- med = .4 -->
            <!-- large = .7 -->
            <!-- small = 0.9 -->
            <RadioGroup.Root value="option-one" class="flex-row">
              <div class="flex items-center space-x-2">
                <RadioGroup.Item value="option-one" id="option-one" />
                <Label for="option-one">Option One</Label>
              </div>
              <div class="flex items-center space-x-2">
                <RadioGroup.Item value="option-two" id="option-two" />
                <Label for="option-two">Option Two</Label>
              </div>
            </RadioGroup.Root>
        </div>

        <div class="flex justify-end px-4 mt-8">
            <Gauge class="size-8 mr-4 pb-1 text-muted-foreground"/>
            <h2 class="mr-4 text-muted-foreground">Speed {speedValue}</h2>
            <Slider type="single" bind:value={speedValue} max={1} step={0.01} class="pb-2" ></Slider>
        </div>

    </Card.Content>
</Card.Root>

