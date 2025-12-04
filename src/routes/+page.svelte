<script>
    import MosaicMorph from "$lib/components/sketches/mosaic-morph/mosaic-morph.svelte";
    import * as Carousel from "$lib/components/ui/carousel/index.js";

    import Github from '@lucide/svelte/icons/github';
    import Instagram from '@lucide/svelte/icons/instagram';
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

<div class="flex justify-around sm:justify-between align-baseline pb-4 max-w-sm sm:max-w-lg mx-4 sm:mx-auto items-baseline">
<h1 class="text-4xl text-center font-semibold text-muted-foreground py-4 font-mono">art by fitz</h1>
<div class="flex gap-4">
  <a href="https://github.com/sf1tzp">
    <Github class="size-8 text-muted-foreground"/>
  </a>
  <a href="https://instagram.com/sf1tzp">
    <Instagram class="size-8 text-muted-foreground"/>
  </a>
</div>
</div>