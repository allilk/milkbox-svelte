<script>
  export let id
  export let mimetype
  export let name
  export let size
  export let webview

  export let display_folder_id

  const ifIncludes = (mimetype) => {
    let emojiMime = '❔'
    if (mimetype.includes('video')) {
      emojiMime = '📺'
    } else if (mimetype.includes('audio')) {
      emojiMime = '🎵'
    } else if (mimetype.includes('image/')) {
      emojiMime = '🖼️'
    } else if (mimetype.includes('/x-iso') || mimetype.includes('cd-image')) {
      emojiMime = '💿'
    } else if (mimetype.includes('/zip') || mimetype.includes('rar') || mimetype.includes('compressed')) {
      emojiMime = '🗄️'
    } else if (mimetype.includes('text')) {
      emojiMime = '📃'
    }
    return emojiMime
  }

</script>

<span class="contents">
  <div {id} class="col-span-6 shadow-sm not-selected grid grid-cols-6 py-3 px-4 {mimetype}" title={name}>
    <div class="file-title w-full col-span-5 truncate inline">
      {ifIncludes(mimetype)}
      {name} 
      {#if display_folder_id}
        <span class="text-xs file-id overflow-x-hidden">({id})</span>
      {/if}
    </div>
    <div class="col-span-1 file-size inline text-right">{size}</div>
  </div>
</span>
