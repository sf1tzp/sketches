<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import type p5Type from 'p5';
    import { createSketch } from './script';

    let container: HTMLDivElement;
    let p5Instance: p5Type;

    onMount(async () => {
        const p5 = (await import('p5')).default;
        p5Instance = new p5(createSketch(container));
    });

    onDestroy(() => {
        if (p5Instance) {
            p5Instance.remove();
        }
    });
</script>

<div bind:this={container} class="w-full h-full"></div>
