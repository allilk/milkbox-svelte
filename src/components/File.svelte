<script>
  export let id
  export let mimetype
  export let name
  export let size
  export let webview
  export let thumbnail

  export let displayLargerPreview
  export let displayFileId

  if (displayLargerPreview && thumbnail) {
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
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }
  let readSize = formatBytes(size)
</script>

<div style="display: none;">{webview}</div>

<div {id} class="col-span-6 shadow-sm not-selected grid grid-cols-6 py-3 my-1 px-4 {mimetype}">
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
    {#if displayFileId == true}
      <span class="text-xs file-id overflow-x-hidden hover:text-black">({id})</span>
    {/if}
  </div>
  <div class="col-span-1 file-size inline text-right">{readSize}</div>
</div>
