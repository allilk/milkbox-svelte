<script>
  export let id
  export let mimetype
  export let name
  export let size
  export let webview
  export let raw_size
  export let thumbnail

  export let larger_previews
  export let display_folder_id
  // &sz
  if (larger_previews && thumbnail) {
    thumbnail = thumbnail.replace('=s220', '')
  }
  if (thumbnail) {
    if (thumbnail.endsWith('&sz') || thumbnail.endsWith('&sz=s220')) {
      thumbnail = ''
    }
  }

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
  const showThumbnail = (folder) => {
    try {
      let theImage = document.getElementById(`img-${folder}`)
      theImage.classList.remove('hidden')
      theImage.style = 'left: 80px'
    } catch (err) {
      console.log(err)
    }
  }
  const hideThumbnail = (folder) => {
    try {
      let theImage = document.getElementById(`img-${folder}`)
      theImage.classList.add('hidden')
    } catch (err) {
      console.log(err)
    }
  }
</script>

<div style="display: none;">{webview}</div>

<div {id} class="col-span-6 shadow-sm not-selected grid grid-cols-6 py-3 px-4 {mimetype}">
  <div class="file-title w-full col-span-5 truncate inline">
    {#if thumbnail}
      <div id="img-{id}" class="hidden absolute">
        <img src={thumbnail} alt="" />
      </div>
      <span on:mouseenter={showThumbnail(id)} on:mouseleave={hideThumbnail(id)}>
        {ifIncludes(mimetype)}
      </span>
    {:else}
      {ifIncludes(mimetype)}
    {/if}
    <span title={name}>
      {name}
    </span>
    {#if display_folder_id}
      <span class="text-xs file-id overflow-x-hidden hover:text-black">({id})</span>
    {/if}
  </div>
  <div class="col-span-1 file-size inline text-right" raw={raw_size}>{size}</div>
</div>
