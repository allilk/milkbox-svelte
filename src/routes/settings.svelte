<script>
  import { onMount, afterUpdate } from 'svelte'
  import db from './drive/connection'
  import Switch from '../components/Switch.svelte'

  let themeSelector = 'dark-theme'
  let displayFolderId = false
  let displayFileId = false
  let displayLargerPreview = false
  let cacheImages = false

  const updateValues = () => {
    // Update theme
    let currentTheme = document.getElementById('current-theme')
    currentTheme.href = themeSelector + '.css'
    // Update values
    db.settings.update(0, {
      theme: themeSelector,
      displayfolderid: displayFolderId,
      displayfileid: displayFileId,
      largerpreviews: displayLargerPreview,
      cacheimages: cacheImages
    })
  }
  const getDefaults = async () => {
    const res = await db.settings.where('user').equals(0).toArray()
    let userDefaults = res[0]
    themeSelector = userDefaults.theme
    displayFolderId = userDefaults.displayfolderid
    displayFileId = userDefaults.displayfileid
    displayLargerPreview = userDefaults.largerpreviews
    cacheImages = userDefaults.cacheimages
  }
  afterUpdate(async () => {
    updateValues()
  })
  onMount(async () => {
    getDefaults()
  })
</script>

<svelte:head>
  <title>milkbox</title>
</svelte:head>
<div class="mx-8 leading-loose">
  <div class="header text-2xl border-b-2 pb-2 mb-2">Visual</div>
  <div class="mx-4">
    <div class="mb-1">
      <form>
        <label for="theme"><b>Theme:</b></label>
        <select bind:value={themeSelector} name="theme" id="#themes">
          <option value="dark-theme">Dark Theme</option>
          <option value="dark-gold-theme">Dark Gold Theme</option>
          <option value="darker-dark-theme">Darker Dark Theme</option>
          <option value="light-theme">Light Theme</option>
          <option value="silver-theme">Silver Theme</option>
        </select>
      </form>
    </div>
    <div>
      <div class="inline-flex">
        <label for="display-Fid"><b>Display Folder IDs:</b></label>
        <Switch bind:checked={displayFolderId} />
      </div>
    </div>
    <div>
      <div class="inline-flex">
        <label for="display-Fid"><b>Display File IDs:</b></label>
        <Switch bind:checked={displayFileId} />
      </div>
    </div>
    <div>
      <div class="inline-flex">
        <label for="larger-previews"><b>Display Larger Previews:</b></label>
        <Switch bind:checked={displayLargerPreview} />
      </div>
    </div>
  </div>
  <div class="header text-2xl border-b-2 pb-2 mb-2">Backend</div>
  <div class="mx-4">
    <div class="inline-flex">
      <label for="null"><b>Cache Images:</b></label>
      <Switch bind:checked={cacheImages} />
    </div>
  </div>
</div>
