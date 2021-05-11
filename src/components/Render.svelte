<script>
  import Folder from './Folder.svelte'
  import File from './File.svelte'
  import db from '../routes/drive/connection'
  import { onMount } from 'svelte'
  import getFiles from '../routes/drive/files'
  import natsort from '../scripts/natsort.min'
  import { goto } from '@sapper/app'
  import { folderId } from '../routes/stores'

  // export let folder_id
  export let promise
  export let sortedName = 0
  export let sortedSize = 0
  export let itemList

  let PEOPLE_ID, keyCode
  let lineSelected = 0

  let displayFolderId = false
  let displayFileId = false
  let displayLargerPreview = false
  let cacheImages = false

  const createFiles = new getFiles()

  const getDefaults = async () => {
    const res = await db.settings.where('user').equals(0).toArray()
    let userDefaults = res[0]
    displayFolderId = userDefaults.displayfolderid
    displayFileId = userDefaults.displayfileid
    displayLargerPreview = userDefaults.largerpreviews
    cacheImages = userDefaults.cacheimages
  }
  onMount(async () => {
    if (!PEOPLE_ID) {
      PEOPLE_ID = localStorage.getItem('PEOPLE_ID')
    }
    getDefaults()
    // promise = await createFiles.init(false, PEOPLE_ID, folder_id)
    
  })
  const getTheFiles = async (refresh, folder_id) => {
    if (folder_id == 'shared-drives') {
      goto('/drive/shared-drives')
    } else {
      promise = []
      window.history.replaceState({}, '','/drive/'+folder_id);
      folderId.set(folder_id)
      lineSelected = 0

      promise = await createFiles.init(refresh, PEOPLE_ID, folder_id)
      
      itemList = document.getElementsByClassName('not-selected')
    }
  }
  const handleKeydown = async (event) => {
    keyCode = event.keyCode
    if (keyCode == 83 || keyCode == 40) {
      if (lineSelected < itemList.length - 1) {
        if (typeof itemList[lineSelected] != undefined) {
          itemList[lineSelected].classList.remove('selected')
        }
        lineSelected += 1
        let objSelected = itemList[lineSelected]
        objSelected.classList.add('selected')
        let obj = document.getElementsByClassName('selected')[0]
        obj.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    } else if (keyCode == 87 || keyCode == 38) {
      if (lineSelected > 0) {
        if (typeof itemList[lineSelected] != undefined) {
          itemList[lineSelected].classList.remove('selected')
        }
        lineSelected -= 1
        let objSelected = itemList[lineSelected]
        objSelected.classList.add('selected')
        let obj = document.getElementsByClassName('selected')[0]
        obj.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    } else if (keyCode == 13) {
      // try {
      //   event.preventDefault()
      //   let selObj = document.getElementsByClassName('selected')[0]
      //   // let linkObj = selObj.getElementsByTagName('a')[0]
      //   // linkObj.click()
      // } catch {}
    }
  }
  const sortByName = (sorted) => {
    let parentLink = promise[0]
    promise.shift()
    let newList = promise
    let sorter = natsort({ insensitive: true })
    if (sorted == 1) {
      sortedName = 0
      newList = newList.sort((a, b) => sorter(a.name, b.name))
    } else {
      sortedName = 1
      sorter = natsort({ insensitive: true, desc: true })
      newList = newList.sort((a, b) => sorter(a.name, b.name))
    }
    newList.unshift(parentLink)
    promise = newList
  }
  const sortBySize = (sorted) => {
    let parentLink = promise[0]
    promise.shift()
    let newList = promise
    if (sorted == 1) {
      sortedSize = 0
      newList = newList.sort((a, b) => a.raw_size - b.raw_size)
    } else {
      sortedSize = 1
      newList = newList.sort((a, b) => b.raw_size - a.raw_size)
    }
    newList.unshift(parentLink)
    promise = newList
  }
</script>

<svelte:window on:keydown={handleKeydown} />
<div class="sticky grid items-center grid-cols-6 text-sm">
  <div id="sort-name" on:click={sortByName(sortedName)} class="col-span-5 py-3 font-bold animation-pulse">Name</div>
  <div id="sort-size" on:click={sortBySize(sortedSize)} class="col-span-1 mr-8 font-bold text-right file-size">Size</div>
</div>
<div id="content-list" class="grid grid-cols-6 text-sm">
  {#await promise}
    <div />
  {:then promisee}
    {#each promisee as item}
      {#if item.mimetype == 'folder'}
        <span class="contents cursor-pointer" on:click={getTheFiles(false, item.id)}>
          <Folder {displayFolderId} {...item} />
        </span>
      {:else}
        <span class="contents">
          <File {displayFileId} {displayLargerPreview} {...item} />
        </span>
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
