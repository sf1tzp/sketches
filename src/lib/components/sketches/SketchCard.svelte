<script lang="ts" module>
    /**
     * Props for the SketchCard component
     * Each sketch should implement controls as a snippet for its specific UI
     */
    export interface SketchCardProps {
        /** Title displayed in the card header */
        title: string;
        /** The sketch's index in the carousel (0-based) */
        index: number;
        /** Snippet for sketch-specific controls */
        controls?: import('svelte').Snippet;
        /** Snippet for the sketch canvas content */
        children: import('svelte').Snippet<[{ isActive: boolean }]>;
    }
</script>

<script lang="ts">
    import { getEmblaContext } from '$lib/components/ui/carousel/context.js';
    import * as Card from '$lib/components/ui/card/index.js';

    let { title, index, controls, children }: SketchCardProps = $props();

    // Get carousel context to determine visibility
    const carouselContext = getEmblaContext('SketchCard');

    // Derive whether this sketch is currently active/visible
    let isActive = $derived(carouselContext.selectedIndex === index);
</script>

<Card.Root class="max-w-lg h-vh mx-4 mb-4 sm:mx-auto">
    <Card.Header>
        <Card.Title class="font-light text-center text-ld font-mono">{title}</Card.Title>
    </Card.Header>
    <Card.Content class="flex flex-col px-4">
        <div class="w-full h-100 sm:h-128">
            {@render children({ isActive })}
        </div>
        {#if controls}
            {@render controls()}
        {/if}
    </Card.Content>
</Card.Root>
