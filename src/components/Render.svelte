<script>
  export let promise

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
    } else if (mimetype.includes('folder')) {
      emojiMime = '📂'
    }
    return emojiMime
  }
</script>

<div id="content-list" class="grid grid-cols-6 text-sm">
  {#await promise}
    <div id="#loading" class="col-span-full">
      <center>
        <div class="lds-ripple">
          <div />
          <div />
        </div>
      </center>
    </div>
  {:then promisee}
    {#each promisee as item}
      <a class="contents" href="drive/{item.id}">
        <div id={item.id} class="col-span-6 shadow-sm not-selected grid grid-cols-6 py-3 px-4 {item.mimetype}" title={item.name}>
          <div class="file-title w-full col-span-5 truncate inline">
            {ifIncludes(item.mimetype)}
            {item.name}{#if item.mimetype == 'folder'}/{/if}
          </div>
          <div class="col-span-1 file-size inline text-right">{item.size}</div>
        </div>
      </a>
    {/each}
  {:catch error}
    <p>{error}</p>
  {/await}
</div>
