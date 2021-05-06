<script>
  export let id
  export let mimetype
  export let name
  export let size
  export let webview
  export let raw_size
  export let display_folder_id

</script>
<div style="display: none;">{webview}</div>
<span class="contents">
  <div {id} class="col-span-6 shadow-sm not-selected grid grid-cols-6 py-3 px-4 {mimetype}" title={name}>
    <div class="file-title w-full col-span-5 truncate inline">
      📂 {name}/ 
      {#if display_folder_id}
        <span class="text-xs file-id overflow-x-hidden">({id})</span>
      {/if}
    </div>
    <div class="col-span-1 file-size inline text-right" raw="{raw_size}">{size}</div>
  </div>
</span>
