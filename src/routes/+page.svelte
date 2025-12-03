<script>
    import { Card } from "$lib/components/ui/card";
    import MosaicMorph from "$lib/components/sketches/mosaic-morph.svelte";
</script>

<h1 class="text-4xl text-center font-semibold m-8">Sketches</h1>

<Card class="max-w-lg mx-4 md:mx-auto overflow-hidden">
    <div class="flex justify-center">
        <div class="h-36 w-full px-2">
            <MosaicMorph />
        </div>

    </div>
</Card>