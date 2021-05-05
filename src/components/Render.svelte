<script>
  import Folder from './Folder.svelte'
  import File from './File.svelte'
  export let promise
  let PEOPLE_ID
  let display_folder_id = false
  import db from '../routes/drive/connection'
  import { onMount } from 'svelte'
  import getFiles from '../routes/drive/files'
  const createFiles = new getFiles()
  onMount(() => {
    if (!PEOPLE_ID) {
        PEOPLE_ID = localStorage.getItem('PEOPLE_ID')
      }
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

  // call func: {getFiles(id)}
  const getTheFiles = async (refresh, folderId) => {
    promise = []
    promise = await createFiles.init(refresh, PEOPLE_ID, folderId)
  }
</script>

<div id="content-list" class="grid grid-cols-6 text-sm">
  {#await promise}
    <div />
  {:then promisee}
    {#each promisee as item}
      {#if item.mimetype == 'folder'}
        <span class="contents" on:click={getTheFiles(false, item.id)}>
          <Folder {display_folder_id} {...item} />
        </span>
      {:else}
        <File {display_folder_id} {...item} />
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
