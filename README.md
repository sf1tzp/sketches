# Sketches

A collection of p5.js creative coding sketches displayed in a carousel.

## Project Structure

```
src/lib/components/sketches/
├── SketchCard.svelte          # Reusable wrapper with visibility-aware pause/resume
├── types.ts                   # Shared TypeScript types
├── _template/                 # Template for creating new sketches
│   ├── template.svelte        # Component template
│   └── script.svelte.ts       # p5.js sketch logic template
├── mosaic-morph/              # Example sketch
│   ├── mosaic-morph.svelte
│   └── script.svelte.ts
└── your-new-sketch/           # Add new sketches here!
    ├── your-sketch.svelte
    └── script.svelte.ts
```

## Creating a New Sketch

1. **Copy the template folder:**
   ```bash
   cp -r src/lib/components/sketches/_template src/lib/components/sketches/your-sketch-name
   ```

2. **Rename the component file:**
   ```bash
   mv src/lib/components/sketches/your-sketch-name/template.svelte \
      src/lib/components/sketches/your-sketch-name/your-sketch-name.svelte
   ```

3. **Edit `script.svelte.ts`:**
   - Add your sketch-specific configuration to `SketchConfig`
   - Implement your `setup()` and `draw()` functions
   - The pause/resume functionality is already built in!

4. **Edit the `.svelte` component:**
   - Update the title in `<SketchCard title="your-sketch-name">`
   - Add any controls your sketch needs in the `{#snippet controls()}` block
   - Pass configuration values to `createSketch()`

5. **Add to the carousel in `+page.svelte`:**
   ```svelte
   <script>
       import MosaicMorph from "$lib/components/sketches/mosaic-morph/mosaic-morph.svelte";
       import YourSketch from "$lib/components/sketches/your-sketch-name/your-sketch-name.svelte";
   </script>

   <Carousel.Root>
     <Carousel.Content>
       <Carousel.Item>
         <MosaicMorph index={0} />
       </Carousel.Item>
       <Carousel.Item>
         <YourSketch index={1} />
       </Carousel.Item>
     </Carousel.Content>
   </Carousel.Root>
   ```

## How Visibility-Aware Pause/Resume Works

The pattern works like this:

1. **`SketchCard.svelte`** reads the carousel's `selectedIndex` from context
2. Each sketch passes its `index` prop to `SketchCard`
3. `SketchCard` compares `selectedIndex === index` to determine if this sketch is visible
4. It passes `isActive` to the children snippet
5. The sketch component calls `handleVisibilityChange(isActive)` which triggers `pause()` or `resume()`
6. The p5 sketch uses `noLoop()` and `loop()` to pause/resume the draw loop

This ensures only the currently visible sketch is running its animation loop, saving CPU/GPU resources.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
