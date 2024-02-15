<script lang="ts">
   import type { SvgPlaceData } from "$lib/components/svg";
   import SvgContainer from "$lib/components/svg/svgContainer.svelte";
   import SvgGrid from "$lib/components/svg/svgGrid.svelte";
   import SvgZone from "$lib/components/svg/svgZone.svelte";

   let places = $state<SvgPlaceData[]>([]);

   function addZone() {
      places.push({
         x: 50,
         y: 50,
         width: 100,
         height: 100,
         fill: "rgb(203 213 225)",
         rows: [],
      });
   }

   function addPlace() {
      places[0].rows!.push({
         x: 0,
         y: 0,
         width: 100,
         height: 100,
         fill: "rgb(203 213 225)",
      });
   }
</script>

<div class="bg-slate-800 w-full h-[100vh] flex justify-center items-center">
   <div class="w-[800px] flex flex-col gap-4 max-w-[800px] relative">
      <SvgContainer>
         <SvgGrid />
         {#each places as place}
            <SvgZone data={place} />
         {/each}
      </SvgContainer>

      <div
         class="flex absolute top-2 text-sm/[1] left-0 right-0 justify-center"
      >
         <div class="flex gap-2 bg-white rounded-md p-2">
            <button on:click={addZone} class="bg-slate-300 rounded-md px-4 py-2"
               >zone
            </button>
            <button
               on:click={addPlace}
               class="bg-slate-300 rounded-md px-2 lh"
               >place
            </button>
            <button
               on:click={() => alert("click")}
               class="bg-slate-300 rounded-md px-4 py-2"
               >text
            </button>
         </div>
      </div>

      <p class="text-white">
         <!-- {JSON.stringify(places, null, 2)} -->
      </p>
   </div>
</div>
