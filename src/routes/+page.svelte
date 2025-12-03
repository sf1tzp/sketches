<script>
    import { Card } from "$lib/components/ui/card";
    import MosaicMorph from "$lib/components/sketches/mosaic-morph.svelte";
</script>

<h1 class="text-4xl text-center font-semibold mt-8">A Sketch</h1>

<Card class="mt-12 max-w-lg mx-4 md:mx-auto overflow-hidden">
    <div class="flex justify-center">
        <div class="h-dvh w-full px-2">
            <MosaicMorph />
        </div>

    </div>
</Card>