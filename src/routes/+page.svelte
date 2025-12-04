<script>
    import MosaicMorph from "$lib/components/sketches/mosaic-morph/mosaic-morph.svelte";
    import * as Carousel from "$lib/components/ui/carousel/index.js";

    import Github from '@lucide/svelte/icons/github';
    import Instagram from '@lucide/svelte/icons/instagram';
</script>

{#snippet FitzLogo({ fill = "currentColor", stroke = "none", class: className = "" })}
<svg class={className} viewBox="0 0 3700 882" xmlns="http://www.w3.org/2000/svg">
    <path fill={fill} stroke={stroke} d="M 1211 44 C 1168.163574 43.894775 1126.135986 46.93689 1085 52 C 1045.577515 57.066528 1010.873047 65.535767 980 78 C 947.41333 90.459229 920.895142 106.868164 902 126 C 883.106567 144.393066 874.067017 166.708252 874 194 L 874 268 C 874 268 41.026978 266.015381 41 266 L 98 359 L 874 361 L 872 831 L 1135 832 L 1136 362 L 1326 362 L 1325 832 L 1587 833 L 1588 363 L 1720 363 L 1719 702 C 1718.963867 716.752197 1723.759521 731.747681 1734 748 C 1745.957275 763.519531 1764.041992 777.401489 1788 790 C 1811.957031 802.598022 1843.609863 813.789917 1883 822 C 1924.103516 830.214722 1975.028076 833.852783 2035 834 L 2143 834 L 2816 836 L 2816 836 L 3593 838 L 3658 838 L 3592 731 L 2393 728 L 2818 366 L 2761 273 C 2445.749512 272.015869 2297.250732 271.78064 1982 271 L 1983 103 L 1720 102 L 1720 270 L 1136 269 L 1136 189 C 1136.063477 163.183838 1161.596191 150.873779 1213 151 L 1327 151 L 1589 151 L 1589 45 L 1332 45 Z M 1982 364 L 2129 364 L 2531 365 L 2114 728 C 2113.990479 728.005005 2084.577637 727.641602 2068 727 C 2049.152832 726.215454 2033.699463 723.722412 2020 720 C 2006.30127 716.27832 1995.83667 711.393188 1989 704 C 1983.878174 696.611938 1980.967285 686.277344 1981 673 Z"/>
</svg>
{/snippet}

<div class="mt-4">
<Carousel.Root class="mx-auto w-full max-w-lg">
  <Carousel.Content>
      <Carousel.Item>
        <MosaicMorph index={0} initialSize={0.4} initialSpeed={0.8}/>
      </Carousel.Item>
      <Carousel.Item>
        <MosaicMorph index={1} initialSize={0.1} initialSpeed={0.9} />
      </Carousel.Item>
      <Carousel.Item>
        <MosaicMorph index={2} initialSize={1} initialSpeed={0.2} />
      </Carousel.Item>
  </Carousel.Content>
  <Carousel.Previous />
  <Carousel.Next />
</Carousel.Root>
</div>

<div class="flex justify-between px-8 sm:px-0 sm:max-w-lg sm:mx-auto items-baseline">
<div class="flex gap-4">
  {@render FitzLogo({ fill: "var(--muted-foreground)", class: "w-28 sm:w-40 sm:pl-4" })}
</div>
<div class="flex gap-4 sm:pr-4">
  <a href="https://github.com/sf1tzp">
    <Github class="size-8 text-muted-foreground"/>
  </a>
  <a href="https://instagram.com/sf1tzp">
    <Instagram class="size-8 text-muted-foreground"/>
  </a>
</div>
</div>