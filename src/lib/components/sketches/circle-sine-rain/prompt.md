# Circle Sine Raine

A sine wave, rotated 90*, plots points vertically across the center of the canvas.

From the bottom-up, every few pixels (stackInterval), draw an elipse centered around the point on the sine-line at that height.

After all elipse have been drawn, scatter drops of color randomly accross the canvas, bringing the feeling of gentle rain drops.

## Animation Styling

Instead of a continuous oscillation loop, we will loop:

- pick a starting palette and background color
- pick a random phase alignment and magnitude for the sine function.
- draw the elipses at 100% opacity
- scatter rain drops

- pick a new palette and background color
- Generate the next image
- morph/transform transistion between the original image and thew new one

- repeat


