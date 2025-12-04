<script>
    import MosaicMorph from "$lib/components/sketches/mosaic-morph/mosaic-morph.svelte";
    import * as Carousel from "$lib/components/ui/carousel/index.js";
</script>


<div class="mt-4">
<Carousel.Root class="mx-auto w-full max-w-lg">
  <Carousel.Content>
    {#each Array(1), i}
      <Carousel.Item>
        <MosaicMorph />
      </Carousel.Item>
    {/each}
  </Carousel.Content>
  <Carousel.Previous />
  <Carousel.Next />
</Carousel.Root>
</div>

<h1 class="text-4xl text-center font-semibold text-muted-foreground py-2">Sketches</h1>