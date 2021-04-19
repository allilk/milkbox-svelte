<script>
  import Folder from './Folder.svelte'
  import File from './File.svelte'
  export let promise
  let display_folder_id = false
  import db from '../routes/drive/connection'
  import { onMount } from 'svelte'

  onMount(() => {
    // Whether or not to display folder/file ids
    db.settings
      .where('user')
      .equals(0)
      .toArray()
      .then(function (resp) {
        if (!resp[0].displayfid || resp[0].displayfid == 'yes') {
          display_folder_id = true
        }
      })
  })
</script>

<div id="content-list" class="grid grid-cols-6 text-sm">
  {#await promise}
    <div />
  {:then promisee}
    {#each promisee as item}
      {#if item.mimetype == 'folder'}
        <Folder display_folder_id={display_folder_id} {...item} />
      {:else}
        <File  display_folder_id={display_folder_id} {...item} />
      {/if}
    {/each}
    {#if promisee == 0}
      <div id="#loading" class="col-span-full">
        <center>
          <div class="lds-ripple">
            <div />
            <div />
          </div>
        </center>
      </div>
    {/if}
  {:catch error}
    <p>{error}</p>
  {/await}
</div>
