<script lang="ts">
   import { getContext } from "svelte";
   import { key } from "./key";
   import type { SvgContainerContext } from ".";

   const { getContainer, getWidth, getHeight } = getContext<SvgContainerContext>(key);

   let gridStep = $state(20);

   const gridWidth = getWidth()
   const gridHeight = getHeight()

   function calculateCountLines() {
      return [
         +(gridWidth  / gridStep).toFixed(0),
         +(gridHeight / gridStep).toFixed(0),
      ];
   }

   let [countLinesX, countLinesY] = calculateCountLines();
</script>

<g>
   <g>
      <!-- Grid lines -->
      {#each { length: countLinesX } as _, i}
         <line
            x1={1 * gridStep * i}
            y1={0}
            x2={1 * gridStep * i}
            y2={gridHeight}
            stroke="#5c6370"
            stroke-width="0.06"
         />
      {/each}

      {#each { length: countLinesY } as _, i}
         <line
            x1={0}
            y1={1 * gridStep * i}
            x2={gridWidth}
            y2={1 * gridStep * i}
            stroke="#5c6370"
            stroke-width="0.06"
         />
      {/each}
   </g>

   <g>
      <!-- Main lines -->
      {#each { length: countLinesX } as _, i}
         {#if i % 5 === 0}
            <line
               x1={1 * gridStep * i}
               y1={0}
               x2={1 * gridStep * i}
               y2={gridHeight}
               stroke={"#f9fafa"}
               stroke-width="0.06"
            />
         {/if}
      {/each}

      {#each { length: countLinesY } as _, i}
         {#if i % 5 === 0}
            <line
               x1={0}
               y1={1 * gridStep * i}
               x2={gridWidth}
               y2={1 * gridStep * i}
               stroke={"#f9fafa"}
               stroke-width="0.06"
            />
         {/if}
      {/each}
   </g>

   <g>
      <!-- Grid numbers -->
      {#each [0, 5, 10, 15, 20] as number, i}
         <text
            x={5 * i}
            y={-1}
            font-size="0.8"
            text-anchor="middle"
            fill="#f9fafa"
         >
            {number}
         </text>

         <text
            x={-1}
            y={5 * i}
            font-size="0.8"
            text-anchor="middle"
            dominant-baseline="middle"
            fill="#f9fafa"
         >
            {number}
         </text>
      {/each}
   </g>
</g>
