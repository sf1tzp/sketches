<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import type p5Type from 'p5';
    import { createSketch, type SketchController } from './script.svelte';
    import SketchCard from '$lib/components/sketches/SketchCard.svelte';
    import { Label } from "$lib/components/ui/label/index.js";
    import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
    import Layers from '@lucide/svelte/icons/layers';
    import Waves from '@lucide/svelte/icons/waves';
    import CloudRain from '@lucide/svelte/icons/cloud-rain';

    interface Props {
        /** The index of this sketch in the carousel (for visibility tracking) */
        index?: number;
    }

    let { index = 0 }: Props = $props();

    let container: HTMLDivElement;
    let p5Instance: p5Type;
    let sketchController: SketchController | null = null;

    // Reactive state for controls
    let stackInterval = $state(15);
    let waveAmplitude = $state(80);
    let rainDensity = $state(5);

    onMount(async () => {
        const p5 = (await import('p5')).default;
        const { sketch, getController } = createSketch(container, {
            getStackInterval: () => stackInterval,
            getWaveAmplitude: () => waveAmplitude,
            getWaveFrequency: () => 3,
            getRainDensity: () => rainDensity,
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
            <Layers class="size-4 mt-1 font-light text-muted-foreground"/>
            <h2 class="font-light text-muted-foreground hidden sm:inline-block font-mono">density</h2>
        </div>
        <RadioGroup.Root value="15" onValueChange={(v) => stackInterval = parseInt(v)} class="flex flex-row gap-4">
          <div class="flex items-center space-x-2">
            <RadioGroup.Item value="30" id="stack-sparse" />
            <Label for="stack-sparse" class="text-muted-foreground font-mono">sparse</Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroup.Item value="15" id="stack-med" />
            <Label for="stack-med" class="text-muted-foreground font-mono">med</Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroup.Item value="8" id="stack-dense" />
            <Label for="stack-dense" class="text-muted-foreground font-mono">dense</Label>
          </div>
        </RadioGroup.Root>
    </div>
    <div class="flex justify-start mx-2 mt-8 gap-4">
        <div class="flex gap-2">
            <Waves class="size-4 mt-1 font-light text-muted-foreground"/>
            <h2 class="font-light text-muted-foreground font-mono hidden sm:inline-block">wave</h2>
        </div>
        <RadioGroup.Root value="80" onValueChange={(v) => waveAmplitude = parseInt(v)} class="flex flex-row gap-4">
          <div class="flex items-center space-x-2">
            <RadioGroup.Item value="30" id="wave-calm" />
            <Label for="wave-calm" class="text-muted-foreground font-mono">calm</Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroup.Item value="80" id="wave-med" />
            <Label for="wave-med" class="text-muted-foreground font-mono">med</Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroup.Item value="150" id="wave-wild" />
            <Label for="wave-wild" class="text-muted-foreground font-mono">wild</Label>
          </div>
        </RadioGroup.Root>
    </div>
    <div class="flex justify-start mx-2 mt-8 gap-4">
        <div class="flex gap-2">
            <CloudRain class="size-4 mt-1 font-light text-muted-foreground"/>
            <h2 class="font-light text-muted-foreground font-mono hidden sm:inline-block">rain</h2>
        </div>
        <RadioGroup.Root value="5" onValueChange={(v) => rainDensity = parseInt(v)} class="flex flex-row gap-4">
          <div class="flex items-center space-x-2">
            <RadioGroup.Item value="0" id="rain-none" />
            <Label for="rain-none" class="text-muted-foreground font-mono">none</Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroup.Item value="5" id="rain-light" />
            <Label for="rain-light" class="text-muted-foreground font-mono">light</Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroup.Item value="15" id="rain-heavy" />
            <Label for="rain-heavy" class="text-muted-foreground font-mono">heavy</Label>
          </div>
        </RadioGroup.Root>
    </div>
{/snippet}

<SketchCard title="circle-sine-rain" {index} {controls}>
    {#snippet children({ isActive })}
        {@const _ = handleVisibilityChange(isActive)}
        <div bind:this={container} class="size-full overflow-clip touch-pan-y"></div>
    {/snippet}
</SketchCard>
