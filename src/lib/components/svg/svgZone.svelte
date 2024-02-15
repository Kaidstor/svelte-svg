<script lang="ts">
   import type { SvgPlaceData } from ".";
   type Props = { data: SvgPlaceData };

   const { data } = $props<Props>();
</script>

<g>
   <rect rx="1rem" {...data} />
   <!-- <text {...data}>{JSON.stringify(data)}</text> -->
   #{#each data.rows as row}
      <rect rx="1rem" {...row} />
   {/each}
</g>
